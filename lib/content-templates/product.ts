import {
  INTRO_HOOKS,
  BUY_TIPS,
  CTA_KULTIVA,
  PRICE_COMMENT,
  CLOSING,
  TRUST_NOTES,
} from './variants';
import { pickVariant, stringSeed, formatPrice } from '../utils';

interface ProductPageContentInput {
  name: string;
  slug: string;
  categoryName?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  avgPrice?: number | null;
  offerCount: number;
}

/** Construit la description longue d'une fiche produit (markdown). */
export function buildProductDescription(input: ProductPageContentInput): string {
  const seed = stringSeed(input.slug);
  const hook = pickVariant(INTRO_HOOKS, seed).replace(/%NAME%/g, input.name);
  const tip = pickVariant(BUY_TIPS, seed + 1);
  const cta = pickVariant(CTA_KULTIVA, seed + 2);
  const close = pickVariant(CLOSING, seed + 3);
  const trust = pickVariant(TRUST_NOTES, seed + 4);

  const priceLine = (() => {
    if (!input.minPrice || !input.maxPrice) return '';
    return pickVariant(PRICE_COMMENT, seed + 5)
      .replace('{{MIN}}', formatPrice(input.minPrice))
      .replace('{{MAX}}', formatPrice(input.maxPrice))
      .replace('{{AVG}}', formatPrice(input.avgPrice ?? input.minPrice))
      .replace('{{COUNT}}', String(input.offerCount));
  })();

  const cat = input.categoryName ? `dans la catégorie **${input.categoryName}**` : '';

  return [
    hook,
    '',
    priceLine,
    '',
    `## À retenir`,
    '',
    `- ${tip}`,
    `- ${trust}`,
    '',
    `## Comparer avant d'acheter ${cat}`.trim(),
    '',
    `Notre tableau ci-dessus liste les **${input.offerCount} offre(s)** trouvée(s) pour ${input.name}. ` +
      `Prix mis à jour automatiquement, frais de port indiqués quand le marchand les fournit.`,
    '',
    `## Et après l'achat ?`,
    '',
    cta,
    '',
    close,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Meta description (<=160 car) pour <head>. */
export function buildProductMeta(input: ProductPageContentInput): string {
  const price = input.minPrice ? ` dès ${formatPrice(input.minPrice)}` : '';
  const count = input.offerCount > 0 ? ` · ${input.offerCount} offres` : '';
  const base = `${input.name}${price}${count}. Comparez les prix en France — Kultivaprix.`;
  return base.length > 160 ? base.slice(0, 157) + '…' : base;
}
