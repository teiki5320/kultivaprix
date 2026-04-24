/**
 * Awin Publisher API — Product Feeds
 *
 * Doc : https://wiki.awin.com/index.php/Product_Feed
 *
 * Un feed produit est un CSV/XML téléchargeable par advertiser (URL signée
 * par ton token). L'URL la plus simple est le CSV gzip :
 *   https://productdata.awin.com/datafeed/download/apikey/<TOKEN>/
 *     language/fr/fid/<ADVERTISER_IDS>/bid/<PUBLISHER_ID>/columns/
 *     aw_product_id,merchant_product_id,merchant_name,product_name,
 *     aw_deep_link,search_price,rrp_price,currency,in_stock,
 *     merchant_image_url,ean,brand_name,merchant_category,delivery_cost/
 *     format/csv/delimiter/%7C/compression/gzip/
 *
 * On renseigne AWIN_API_TOKEN, AWIN_PUBLISHER_ID, AWIN_ADVERTISER_IDS dans .env.
 */
import { ingestBatch, log, requiredEnv } from './_shared';
import type { NormalizedOffer } from '../../lib/types';
import { createGunzip } from 'node:zlib';
import { Readable } from 'node:stream';

const COLUMNS = [
  'aw_product_id',
  'merchant_product_id',
  'merchant_name',
  'product_name',
  'aw_deep_link',
  'search_price',
  'rrp_price',
  'currency',
  'in_stock',
  'merchant_image_url',
  'ean',
  'brand_name',
  'merchant_category',
  'delivery_cost',
] as const;

function feedUrl(token: string, publisherId: string, advertiserIds: string) {
  return (
    `https://productdata.awin.com/datafeed/download/apikey/${token}/` +
    `language/fr/fid/${advertiserIds}/bid/${publisherId}/columns/${COLUMNS.join(',')}/` +
    `format/csv/delimiter/%7C/compression/gzip/`
  );
}

async function fetchFeedCsv(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Awin feed HTTP ${res.status}`);
  const nodeStream = Readable.fromWeb(res.body as any).pipe(createGunzip());
  const chunks: Buffer[] = [];
  for await (const c of nodeStream) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks).toString('utf8');
}

function parsePipeCsv(csv: string): Record<string, string>[] {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split('|');
  return lines.slice(1).map((l) => {
    const cells = l.split('|');
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = (cells[i] ?? '').trim()));
    return row;
  });
}

function toOffer(row: Record<string, string>, slug: string): NormalizedOffer | null {
  const price = parseFloat(row.search_price || '');
  if (!row.merchant_product_id || !row.product_name || !row.aw_deep_link) return null;
  return {
    merchantSlug: slug,
    merchantSku: row.merchant_product_id,
    title: row.product_name,
    url: row.aw_deep_link,
    imageUrl: row.merchant_image_url || null,
    price: Number.isFinite(price) ? price : null,
    currency: row.currency || 'EUR',
    inStock: (row.in_stock || '').toLowerCase() === 'yes' || row.in_stock === '1',
    shippingCost: row.delivery_cost ? parseFloat(row.delivery_cost) : null,
    gtin: row.ean || null,
    brand: row.brand_name || null,
    categoryHint: row.merchant_category || null,
    raw: row,
  };
}

export async function runAwin() {
  const token = requiredEnv('AWIN_API_TOKEN');
  const pub = requiredEnv('AWIN_PUBLISHER_ID');
  const ids = (process.env.AWIN_ADVERTISER_IDS ?? '').trim();
  if (!ids) {
    log('awin', 'no AWIN_ADVERTISER_IDS set, skipping');
    return;
  }

  // On tire le feed pour chaque advertiser (slug = sluggify(merchant_name))
  const url = feedUrl(token, pub, ids);
  log('awin', `downloading feed for advertisers ${ids}`);
  const csv = await fetchFeedCsv(url);
  const rows = parsePipeCsv(csv);
  log('awin', `parsed ${rows.length} rows`);

  const grouped = new Map<string, NormalizedOffer[]>();
  for (const r of rows) {
    const name = (r.merchant_name || 'awin-merchant').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const offer = toOffer(r, name);
    if (!offer) continue;
    if (!grouped.has(name)) grouped.set(name, []);
    grouped.get(name)!.push(offer);
  }

  for (const [slug, offers] of grouped) {
    log('awin', `ingesting ${offers.length} offers for ${slug}`);
    const res = await ingestBatch(offers);
    log('awin', `  → inserted=${res.inserted} skipped=${res.skipped}`);
  }
}

if (require.main === module) {
  runAwin().catch((e) => {
    console.error('[awin] fatal', e);
    process.exit(1);
  });
}
