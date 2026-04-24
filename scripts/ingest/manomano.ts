/**
 * ManoMano
 *
 * Deux voies possibles :
 *  1. Via Awin (ManoMano est présent sur Awin FR) → utiliser scripts/ingest/awin.ts
 *     en mettant l'advertiser_id de ManoMano dans AWIN_ADVERTISER_IDS.
 *  2. Flux direct CSV/XML fourni par l'affiliate manager → MANOMANO_FEED_URL.
 *
 * Ce connecteur lit un CSV séparé par `;` (format fréquent ManoMano direct),
 * fallback sur `|`.
 */
import { ingestBatch, log } from './_shared';
import type { NormalizedOffer } from '../../lib/types';

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const delim = lines[0].includes(';') ? ';' : '|';
  const header = lines[0].split(delim).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((l) => {
    const cells = l.split(delim);
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = (cells[i] ?? '').trim()));
    return row;
  });
}

function toOffer(row: Record<string, string>): NormalizedOffer | null {
  const id = row.id || row.sku || row.product_id;
  const title = row.title || row.name || row.product_name;
  const url = row.url || row.deeplink || row.product_url;
  if (!id || !title || !url) return null;
  const price = parseFloat(row.price || row.prix || '');
  const ship = parseFloat(row.shipping || row.delivery_cost || '');
  return {
    merchantSlug: 'manomano',
    merchantSku: id,
    title,
    url,
    imageUrl: row.image || row.image_url || null,
    price: Number.isFinite(price) ? price : null,
    currency: row.currency || 'EUR',
    inStock: /in ?stock|yes|oui|1|disponible/i.test(row.availability || row.stock || '1'),
    shippingCost: Number.isFinite(ship) ? ship : null,
    gtin: row.ean || row.gtin || null,
    brand: row.brand || row.marque || null,
    categoryHint: row.category || row.categorie || null,
    raw: row,
  };
}

export async function runManoMano() {
  const feed = process.env.MANOMANO_FEED_URL;
  if (!feed) {
    log('manomano', 'MANOMANO_FEED_URL not set — use Awin connector instead, skipping');
    return;
  }
  log('manomano', `downloading ${feed}`);
  const res = await fetch(feed);
  if (!res.ok) throw new Error(`manomano feed HTTP ${res.status}`);
  const text = await res.text();
  const rows = parseCsv(text);
  const offers = rows.map(toOffer).filter((o): o is NormalizedOffer => !!o);
  log('manomano', `parsed ${offers.length} offers`);
  const r = await ingestBatch(offers);
  log('manomano', `inserted=${r.inserted} skipped=${r.skipped}`);
}

if (require.main === module) {
  runManoMano().catch((e) => {
    console.error('[manomano] fatal', e);
    process.exit(1);
  });
}
