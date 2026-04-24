import { INTRO_HOOKS, SEASON_TIPS, TRUST_NOTES, CTA_KULTIVA } from './variants';
import { pickVariant, stringSeed } from '../utils';

export interface CategoryContentInput {
  name: string;
  slug: string;
  productCount: number;
  merchantCount: number;
}

export function buildCategoryIntro(input: CategoryContentInput): string {
  const seed = stringSeed(input.slug);
  const hook = pickVariant(INTRO_HOOKS, seed).replace(/%NAME%/g, input.name.toLowerCase());
  const season = pickVariant(SEASON_TIPS, seed + 1);
  const trust = pickVariant(TRUST_NOTES, seed + 2);
  const cta = pickVariant(CTA_KULTIVA, seed + 3);

  return [
    hook,
    '',
    `Nous suivons actuellement **${input.productCount} produit(s)** chez **${input.merchantCount} marchand(s) français** dans la catégorie ${input.name}.`,
    '',
    season,
    '',
    trust,
    '',
    cta,
  ].join('\n');
}

export function buildCategoryMeta(input: CategoryContentInput): string {
  return `${input.name} : ${input.productCount} produits comparés chez ${input.merchantCount} marchands FR. Prix actualisés en continu — Kultivaprix.`.slice(
    0,
    160,
  );
}
