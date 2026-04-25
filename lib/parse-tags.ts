/**
 * Detect product attributes (bio, hybride F1, reproductible, FR origin, ancienne)
 * from a product's title / brand / description, as a fallback when the merchant
 * doesn't provide structured fields.
 */

export interface ProductTags {
  bio: boolean;
  f1: boolean;
  reproductible: boolean;
  origineFR: boolean;
  ancienne: boolean;
}

const BIO_RX = /\b(bio|biologique|certifi[ée]e?\s+bio|agriculture\s+biologique|label\s+ab)\b/i;
const F1_RX = /\bf\s?1\b|hybride\s+f\s?1/i;
const REPRODUCTIBLE_RX = /reproductible|libre[\s-]de[\s-]droit|paysann|non\s+hybride/i;
const FR_RX = /origine\s+france|made\s+in\s+france|graines?\s+fran[çc]aises?|semences?\s+fran[çc]aises?/i;
const ANCIENNE_RX = /vari[ée]t[ée]\s+ancienne|anciennes?\s+vari[ée]t[ée]s?|patrimoine|paysann/i;

export function detectTags(...sources: (string | null | undefined)[]): ProductTags {
  const t = sources.filter(Boolean).join(' ');
  return {
    bio: BIO_RX.test(t),
    f1: F1_RX.test(t),
    reproductible: REPRODUCTIBLE_RX.test(t),
    origineFR: FR_RX.test(t),
    ancienne: ANCIENNE_RX.test(t),
  };
}

/** Render-ready badge metadata, useful for chips in the price table. */
export const TAG_BADGES = {
  bio: { label: 'Bio', tone: 'brand' as const },
  f1: { label: 'Hybride F1', tone: 'sky' as const },
  reproductible: { label: 'Reproductible', tone: 'brand' as const },
  origineFR: { label: 'Origine France', tone: 'terracotta' as const },
  ancienne: { label: 'Variété ancienne', tone: 'butter' as const },
};
