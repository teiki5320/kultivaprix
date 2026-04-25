/**
 * Heuristic eco-score (A → E) for a product, computed from the tags we
 * detect from the title + brand. It's a rule-based proxy — no LCA — so
 * we keep the methodology disclosed on the public page.
 *
 * Scoring weights:
 *  - Bio                       +2
 *  - Origine France            +2
 *  - Reproductible / paysann   +2
 *  - Variété ancienne           +1
 *  - Hybride F1                -1
 */
import type { ProductTags } from './parse-tags';

export type EcoGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface EcoScore {
  grade: EcoGrade;
  points: number;
  reasons: string[];
}

export function computeEcoScore(tags: ProductTags): EcoScore {
  let points = 0;
  const reasons: string[] = [];

  if (tags.bio) { points += 2; reasons.push('Agriculture biologique'); }
  if (tags.origineFR) { points += 2; reasons.push('Origine France'); }
  if (tags.reproductible) { points += 2; reasons.push('Variété reproductible'); }
  if (tags.ancienne) { points += 1; reasons.push('Variété ancienne / paysanne'); }
  if (tags.f1) { points -= 1; reasons.push('Hybride F1 (graines non reproductibles)'); }

  let grade: EcoGrade;
  if (points >= 6) grade = 'A';
  else if (points >= 4) grade = 'B';
  else if (points >= 2) grade = 'C';
  else if (points >= 0) grade = 'D';
  else grade = 'E';

  return { grade, points, reasons };
}

export const ECO_GRADE_META: Record<EcoGrade, { label: string; bg: string; fg: string }> = {
  A: { label: 'Très bon', bg: 'var(--brand)', fg: 'white' },
  B: { label: 'Bon', bg: '#A8D5A2', fg: 'var(--brand-dark)' },
  C: { label: 'Correct', bg: 'var(--butter-yellow)', fg: '#7A5A1E' },
  D: { label: 'Moyen', bg: '#F8CBA6', fg: '#7A3A1E' },
  E: { label: 'Faible', bg: '#E8A87C', fg: 'white' },
};
