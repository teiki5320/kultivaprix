/**
 * Normalisation & déduplication
 *
 * Étapes :
 *  1. Regroupe les products_master "tmp-*" par GTIN quand il existe.
 *  2. Pour ceux sans GTIN, calcule un embedding local (MiniLM-L6-v2 via
 *     @xenova/transformers) et fusionne si cosine > 0.85 avec un produit
 *     canonique déjà existant.
 *  3. Réaffecte les offers vers le produit canonique, supprime les doublons.
 *  4. Génère le slug propre + description via content-templates.
 *  5. Génère les guides (articles) à partir de la bibliothèque de templates.
 *
 * Tourne en local (GitHub Actions). Aucun LLM.
 */
import { supabaseAdmin } from '../lib/supabase';
import { cosine, toSlug } from '../lib/utils';
import { buildProductDescription } from '../lib/content-templates/product';
import { GUIDE_LIBRARY, buildGuide } from '../lib/content-templates/guide';
import { pipeline, env } from '@xenova/transformers';

const COSINE_THRESHOLD = 0.85;
const MODEL = 'Xenova/all-MiniLM-L6-v2';

// Cache models locally in CI to avoid re-downloading on every run
env.cacheDir = process.env.TRANSFORMERS_CACHE ?? './models-cache';

let _embedder: Awaited<ReturnType<typeof pipeline>> | null = null;
async function getEmbedder() {
  if (!_embedder) {
    _embedder = await pipeline('feature-extraction', MODEL, { quantized: true });
  }
  return _embedder;
}

async function embed(text: string): Promise<number[]> {
  const e = await getEmbedder();
  const out = await e(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data as Float32Array);
}

function log(m: string) {
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] [normalize] ${m}`);
}

interface ProdRow {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  gtin: string | null;
  category_id: string | null;
  image_url: string | null;
  embedding: number[] | null;
}

async function fetchAll<T>(builder: () => any, pageSize = 1000): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await builder().range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data?.length) break;
    all.push(...(data as T[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

export async function normalize() {
  const sb = supabaseAdmin();

  // 1. Load all master products
  const products = await fetchAll<ProdRow>(() =>
    sb.from('products_master').select('id, slug, name, brand, gtin, category_id, image_url, embedding'),
  );
  log(`loaded ${products.length} products`);

  // --- Phase A : merge by GTIN ---
  const byGtin = new Map<string, ProdRow>();
  for (const p of products) {
    if (!p.gtin) continue;
    const key = p.gtin.trim();
    if (!key) continue;
    const existing = byGtin.get(key);
    if (!existing) {
      byGtin.set(key, p);
    } else {
      // merge p into existing
      await mergeProducts(existing.id, p.id);
      log(`merged (gtin) ${p.slug} → ${existing.slug}`);
    }
  }

  // Reload products after GTIN merge
  const remaining = await fetchAll<ProdRow>(() =>
    sb.from('products_master').select('id, slug, name, brand, gtin, category_id, image_url, embedding'),
  );

  // --- Phase B : embeddings for products without GTIN or lacking embedding ---
  const canonicals: ProdRow[] = [];
  for (const p of remaining) {
    if (p.slug.startsWith('tmp-')) continue; // non-canonical yet
    canonicals.push(p);
  }

  for (const p of remaining) {
    if (!p.slug.startsWith('tmp-')) continue; // only tmp = to normalize

    // Compute embedding if missing
    let emb = p.embedding;
    if (!emb || emb.length === 0) {
      emb = await embed(`${p.brand ?? ''} ${p.name}`.trim());
      await sb.from('products_master').update({ embedding: emb }).eq('id', p.id);
    }

    // Find best match among canonicals
    let best: { sim: number; row: ProdRow } | null = null;
    for (const c of canonicals) {
      if (!c.embedding) continue;
      const sim = cosine(emb, c.embedding);
      if (sim > (best?.sim ?? 0)) best = { sim, row: c };
    }

    if (best && best.sim >= COSINE_THRESHOLD) {
      await mergeProducts(best.row.id, p.id);
      log(`merged (emb ${best.sim.toFixed(3)}) ${p.slug} → ${best.row.slug}`);
    } else {
      // Promote to canonical : give it a clean slug and description
      const cleanSlug = toSlug(p.name).slice(0, 80) || `produit-${p.id.slice(0, 8)}`;
      const finalSlug = await uniqueSlug(cleanSlug);
      await sb
        .from('products_master')
        .update({ slug: finalSlug, updated_at: new Date().toISOString() })
        .eq('id', p.id);
      canonicals.push({ ...p, slug: finalSlug });
      log(`promoted ${p.slug} → ${finalSlug}`);
    }
  }

  // --- Phase C : rebuild product descriptions ---
  log('rebuilding descriptions…');
  const finalProducts = await fetchAll<ProdRow>(() =>
    sb.from('products_master').select('id, slug, name, brand, gtin, category_id, image_url, embedding'),
  );
  for (const p of finalProducts) {
    if (p.slug.startsWith('tmp-')) continue;
    const { data: offers } = await sb.from('offers').select('price').eq('product_id', p.id);
    const prices = (offers ?? []).map((o) => o.price).filter((n): n is number => typeof n === 'number');
    const min = prices.length ? Math.min(...prices) : null;
    const max = prices.length ? Math.max(...prices) : null;
    const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

    const { data: cat } = p.category_id
      ? await sb.from('categories').select('name').eq('id', p.category_id).single()
      : { data: null };

    const desc = buildProductDescription({
      name: p.name,
      slug: p.slug,
      categoryName: cat?.name ?? null,
      minPrice: min,
      maxPrice: max,
      avgPrice: avg,
      offerCount: prices.length,
    });
    await sb.from('products_master').update({ description: desc }).eq('id', p.id);
  }

  // --- Phase D : rebuild guides ---
  log('rebuilding guides…');
  for (const spec of GUIDE_LIBRARY) {
    const g = buildGuide(spec);
    const { data: cat } = spec.categorySlug
      ? await sb.from('categories').select('id').eq('slug', spec.categorySlug).single()
      : { data: null };
    await sb.from('articles').upsert(
      {
        slug: g.slug,
        title: g.title,
        kind: 'guide',
        template_key: g.key,
        category_id: cat?.id ?? null,
        body_md: g.bodyMd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    );
  }

  log('done');
}

async function mergeProducts(keepId: string, dropId: string) {
  const sb = supabaseAdmin();
  // Move offers
  await sb.from('offers').update({ product_id: keepId }).eq('product_id', dropId);
  await sb.from('price_history').update({ product_id: keepId }).eq('product_id', dropId);
  // Remove duplicate
  await sb.from('products_master').delete().eq('id', dropId);
}

async function uniqueSlug(base: string): Promise<string> {
  const sb = supabaseAdmin();
  let s = base;
  let i = 1;
  while (true) {
    const { data } = await sb.from('products_master').select('id').eq('slug', s).maybeSingle();
    if (!data) return s;
    i += 1;
    s = `${base}-${i}`;
    if (i > 50) return `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
}

if (require.main === module) {
  normalize().catch((e) => {
    console.error('[normalize] fatal', e);
    process.exit(1);
  });
}
