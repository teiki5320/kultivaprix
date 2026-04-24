/**
 * Effiliation — flux produits JSON/CSV
 *
 * Doc (espace éditeur) : Mon compte → API → Flux produits.
 * Endpoint type :
 *   https://apiv2.effiliation.com/apiv2/productfeeds.json?
 *     key=<KEY>&idprogram=<PROGRAM_ID>&fields=id,name,url,price,image,ean,brand,stock,category
 *
 * Note : le token / format exact peuvent varier selon ton contrat Effiliation.
 * Adapte `ENDPOINT_TEMPLATE` si besoin.
 */
import { ingestBatch, log, requiredEnv } from './_shared';
import type { NormalizedOffer } from '../../lib/types';

const ENDPOINT_TEMPLATE =
  'https://apiv2.effiliation.com/apiv2/productfeeds.json?key={KEY}&idprogram={PID}&fields=id,name,url,price,image,ean,brand,stock,category,currency,shipping';

interface EffRow {
  id: string;
  name: string;
  url: string;
  price?: string | number;
  image?: string;
  ean?: string;
  brand?: string;
  stock?: string | number | boolean;
  category?: string;
  currency?: string;
  shipping?: string | number;
}

async function fetchProgram(key: string, programId: string): Promise<EffRow[]> {
  const url = ENDPOINT_TEMPLATE.replace('{KEY}', key).replace('{PID}', programId);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Effiliation HTTP ${res.status} for program ${programId}`);
  const json = (await res.json()) as { products?: EffRow[] } | EffRow[];
  return Array.isArray(json) ? json : json.products ?? [];
}

function toOffer(row: EffRow, programId: string): NormalizedOffer | null {
  if (!row.id || !row.name || !row.url) return null;
  const price = typeof row.price === 'string' ? parseFloat(row.price) : row.price ?? null;
  return {
    merchantSlug: `effiliation-${programId}`,
    merchantSku: row.id,
    title: row.name,
    url: row.url,
    imageUrl: row.image || null,
    price: Number.isFinite(price as number) ? (price as number) : null,
    currency: row.currency || 'EUR',
    inStock: row.stock === true || row.stock === '1' || row.stock === 1 || row.stock === 'yes',
    shippingCost:
      typeof row.shipping === 'string' ? parseFloat(row.shipping) : (row.shipping as number) ?? null,
    gtin: row.ean || null,
    brand: row.brand || null,
    categoryHint: row.category || null,
    raw: row as unknown as Record<string, unknown>,
  };
}

export async function runEffiliation() {
  const key = requiredEnv('EFFILIATION_API_KEY');
  const programs = (process.env.EFFILIATION_PROGRAM_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (programs.length === 0) {
    log('effiliation', 'no EFFILIATION_PROGRAM_IDS, skipping');
    return;
  }

  for (const pid of programs) {
    log('effiliation', `program ${pid}`);
    try {
      const rows = await fetchProgram(key, pid);
      const offers = rows.map((r) => toOffer(r, pid)).filter((o): o is NormalizedOffer => !!o);
      log('effiliation', `  parsed ${offers.length} offers`);
      const res = await ingestBatch(offers);
      log('effiliation', `  inserted=${res.inserted} skipped=${res.skipped}`);
    } catch (e) {
      log('effiliation', `  error: ${(e as Error).message}`);
    }
  }
}

if (require.main === module) {
  runEffiliation().catch((e) => {
    console.error('[effiliation] fatal', e);
    process.exit(1);
  });
}
