/**
 * Quantity parsing — extract grammage, seed count, plant count, etc.
 * from product titles (which is where merchants put it 95% of the time).
 *
 * Returns a normalised value and a unit price helper.
 */

export type QuantityUnit = 'g' | 'seeds' | 'plants' | 'ml' | 'l' | null;

export interface ParsedQuantity {
  /** Normalised amount (grams for 'g', count for 'seeds'/'plants', mL for 'ml', L for 'l'). */
  amount: number | null;
  unit: QuantityUnit;
}

const NUM = '(\\d+(?:[.,]\\d+)?)';
const SEP = '\\s?';

export function parseQuantity(...sources: (string | null | undefined)[]): ParsedQuantity {
  const t = sources.filter(Boolean).join(' ').toLowerCase();

  // Grammage (kg / g / mg). We anchor to a word boundary so '1g' inside '1german' isn't matched.
  const gMatch = t.match(new RegExp(`${NUM}${SEP}(mg|kg|g)\\b`));
  if (gMatch) {
    let value = parseFloat(gMatch[1].replace(',', '.'));
    const u = gMatch[2];
    if (u === 'mg') value /= 1000;
    if (u === 'kg') value *= 1000;
    if (value > 0 && value < 100_000) return { amount: value, unit: 'g' };
  }

  // Seed count: '100 graines', '50 semences'
  const seedsMatch = t.match(new RegExp(`${NUM}${SEP}(graines?|semences?)\\b`));
  if (seedsMatch) return { amount: parseInt(seedsMatch[1], 10), unit: 'seeds' };

  // Plant count: '3 plants', 'lot de 6 plants', 'pack de 12 plants'
  const plantMatch = t.match(new RegExp(`${NUM}${SEP}plants?\\b`));
  if (plantMatch) return { amount: parseInt(plantMatch[1], 10), unit: 'plants' };

  // Volume (ml / l)
  const mlMatch = t.match(new RegExp(`${NUM}${SEP}(ml|cl|l)\\b`));
  if (mlMatch) {
    let value = parseFloat(mlMatch[1].replace(',', '.'));
    const u = mlMatch[2];
    if (u === 'l') return { amount: value, unit: 'l' };
    if (u === 'cl') return { amount: value * 10, unit: 'ml' };
    return { amount: value, unit: 'ml' };
  }

  return { amount: null, unit: null };
}

export interface UnitPrice {
  value: number;
  label: string;
  /** ISO denominator for sorting/comparing comparable rows. */
  basis: string;
}

/**
 * Translate (price, parsed quantity) into a normalised unit price the user
 * can actually compare across rows. We pick a sensible basis for each unit:
 * grams / 100 graines / plant / 100 mL / L.
 */
export function unitPrice(price: number | null, qty: ParsedQuantity): UnitPrice | null {
  if (price == null || qty.amount == null || qty.amount <= 0) return null;
  switch (qty.unit) {
    case 'g':
      return { value: price / qty.amount, label: '€ / g', basis: 'g' };
    case 'seeds':
      return { value: (price / qty.amount) * 100, label: '€ / 100 graines', basis: '100seeds' };
    case 'plants':
      return { value: price / qty.amount, label: '€ / plant', basis: 'plant' };
    case 'ml':
      return { value: (price / qty.amount) * 100, label: '€ / 100 mL', basis: '100ml' };
    case 'l':
      return { value: price / qty.amount, label: '€ / L', basis: 'L' };
    default:
      return null;
  }
}
