/**
 * Liens d'achat affiliés Amazon — tag Kultiva (`kultiva-21`).
 * Reproduit la logique de l'app mobile (lib/data/vegetables_base.dart) :
 * - espèces "graines" par défaut → "graines + <nom>"
 * - bulbes (ail, oignon) et tubercules (pomme de terre) → "<nom> à planter"
 * - accessoires → juste "<nom>"
 */

export const AMAZON_AFFILIATE_TAG = 'kultiva-21';

function normalize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function amazonSearchUrl(
  name: string,
  kind: 'species' | 'accessory',
  category?: string | null,
): string {
  const base = normalize(name);
  const encoded = encodeURIComponent(base).replace(/%20/g, '+');

  let q: string;
  if (kind === 'species') {
    if (category === 'bulbs' || category === 'tubers') {
      q = `${encoded}+a+planter`;
    } else {
      q = `graines+${encoded}`;
    }
  } else {
    q = encoded;
  }
  return `https://www.amazon.fr/s?k=${q}&tag=${AMAZON_AFFILIATE_TAG}`;
}
