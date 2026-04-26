/**
 * Variety extraction from a merchant SKU title.
 *
 * Kultivaprix has SKUs like "Tomate Marmande Bio sachet 0,3g — Kokopelli".
 * We strip the species name + grammage + commercial fluff to surface the
 * cultivar ("Marmande"), so we can group multiple SKUs of the same
 * variety together on the species page.
 *
 * This is heuristic, not perfect — admin can override by hand later.
 */

const FLUFF = [
  'bio', 'biologique', 'graines?', 'graine', 'semences?', 'semence',
  'plants?', 'plant', 'sachet', 'sachets', 'paquet', 'paquets',
  'lot', 'pack', 'kit', 'box', 'coffret',
  'de', 'du', 'la', 'le', 'les', 'en', 'un', 'une', 'des', 'à', 'au',
  'pour', 'avec', 'par', 'reproductibles?', 'paysannes?', 'anciennes?',
  'f1', 'hybride', 'hybrides', 'non', 'mini', 'maxi', 'gros', 'gros',
  'nouveau', 'nouvelle', 'collection',
];

const FLUFF_RX = new RegExp(`\\b(${FLUFF.join('|')})\\b`, 'gi');
// Quantities : 0,3g — 1g — 100g — 1kg — 100mg — 1L — 50ml — 100 graines
const QTY_RX = /\b\d+(?:[.,]\d+)?\s*(?:mg|g|kg|ml|cl|l|graines?|semences?|plants?)\b/gi;
// Trailing merchant tag (after — or | or - in last 25 chars)
const MERCHANT_TAG_RX = /[\s-]*[—|–][^—|–]+$/;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

/**
 * Returns a normalized variety label, or null if nothing meaningful left.
 *
 * @param title — full SKU title from offers.title
 * @param speciesName — eg "Tomate" (from species.name)
 */
export function extractVariety(title: string, speciesName: string): string | null {
  if (!title) return null;
  let s = title;

  // 1. Remove trailing merchant attribution
  s = s.replace(MERCHANT_TAG_RX, '');

  // 2. Remove the species name (with simple plural)
  const speciesNorm = norm(speciesName);
  const speciesRx = new RegExp(`\\b${speciesNorm}s?\\b`, 'gi');
  s = norm(s).replace(speciesRx, ' ');

  // 3. Remove quantities + fluff
  s = s.replace(QTY_RX, ' ').replace(FLUFF_RX, ' ');

  // 4. Strip everything that's not a letter / space / dash
  s = s.replace(/[^a-z\s-]/g, ' ').replace(/\s+/g, ' ').trim();

  // 5. Take up to 3 first words, capitalise nicely
  const words = s.split(/\s+/).filter((w) => w.length >= 2).slice(0, 3);
  if (words.length === 0) return null;
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Group offers by extracted variety. Offers without an extractable variety
 * land in a single 'Variété standard' bucket.
 */
export interface OfferLike {
  offer_id: string;
  title: string;
  price: number | null;
  in_stock: boolean;
  merchant_id: string;
  merchant_name: string;
  merchant_slug: string;
  shipping_cost: number | null;
  last_seen_at: string;
}

export interface VarietyGroup {
  variety: string;
  offers: OfferLike[];
  merchantCount: number;
  minPrice: number | null;
}

export function groupByVariety(
  offers: OfferLike[],
  speciesName: string,
): VarietyGroup[] {
  const buckets = new Map<string, OfferLike[]>();
  for (const o of offers) {
    const v = extractVariety(o.title, speciesName) ?? 'Variété standard';
    const arr = buckets.get(v) ?? [];
    arr.push(o);
    buckets.set(v, arr);
  }

  const groups: VarietyGroup[] = [];
  for (const [variety, list] of buckets) {
    const prices = list
      .map((o) => o.price)
      .filter((p): p is number => p != null);
    const merchants = new Set(list.map((o) => o.merchant_id));
    groups.push({
      variety,
      offers: list,
      merchantCount: merchants.size,
      minPrice: prices.length ? Math.min(...prices) : null,
    });
  }
  // Sort: most merchants first, then cheapest min price
  groups.sort((a, b) => {
    if (b.merchantCount !== a.merchantCount) return b.merchantCount - a.merchantCount;
    return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity);
  });
  return groups;
}
