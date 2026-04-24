import { supabaseAdmin } from '../../lib/supabase';
import type { NormalizedOffer } from '../../lib/types';

/** Écrit un lot d'offres (pré-dédup : product_id nul à ce stade) en DB.
 *  Les offres sont rattachées à des products_master "temporaires" ou
 *  laissées orphelines — le script /scripts/normalize.ts se charge du rapprochement. */
export async function ingestBatch(offers: NormalizedOffer[]): Promise<{ inserted: number; skipped: number }> {
  const sb = supabaseAdmin();
  let inserted = 0,
    skipped = 0;

  // Assure l'existence du marchand
  const merchantCache = new Map<string, string>();
  const getMerchantId = async (slug: string): Promise<string> => {
    if (merchantCache.has(slug)) return merchantCache.get(slug)!;
    const { data: m } = await sb.from('merchants').select('id').eq('slug', slug).single();
    if (m?.id) {
      merchantCache.set(slug, m.id);
      return m.id;
    }
    const { data: created, error } = await sb
      .from('merchants')
      .insert({ slug, name: slug, enabled: true })
      .select('id')
      .single();
    if (error || !created) throw new Error(`Cannot create merchant ${slug}: ${error?.message}`);
    merchantCache.set(slug, created.id);
    return created.id;
  };

  for (const o of offers) {
    try {
      const merchantId = await getMerchantId(o.merchantSlug);

      // placeholder product — sera fusionné par normalize.ts
      const { data: prod } = await sb
        .from('products_master')
        .upsert(
          {
            slug: `tmp-${o.merchantSlug}-${o.merchantSku}`.toLowerCase(),
            name: o.title,
            gtin: o.gtin,
            brand: o.brand,
            image_url: o.imageUrl,
          },
          { onConflict: 'slug' },
        )
        .select('id')
        .single();

      if (!prod?.id) {
        skipped++;
        continue;
      }

      const { error } = await sb.rpc('upsert_offer', {
        p_product_id: prod.id,
        p_merchant_id: merchantId,
        p_merchant_sku: o.merchantSku,
        p_title: o.title,
        p_url: o.url,
        p_image_url: o.imageUrl,
        p_price: o.price,
        p_currency: o.currency,
        p_in_stock: o.inStock,
        p_shipping_cost: o.shippingCost,
        p_raw: o.raw,
      });
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[ingest] upsert_offer error', error.message);
        skipped++;
      } else {
        inserted++;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[ingest] batch row error', (e as Error).message);
      skipped++;
    }
  }

  return { inserted, skipped };
}

export function log(name: string, msg: string): void {
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] [${name}] ${msg}`);
}

export function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.startsWith('PLACEHOLDER')) {
    throw new Error(
      `Missing env ${name} — configure it in .env.local / Vercel / GitHub secrets.`,
    );
  }
  return v;
}
