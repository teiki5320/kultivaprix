/**
 * Cultural attributes for common varieties — exposure, sowing window,
 * spacing, height. Returned for display on a product page when the
 * `attributes` jsonb on products_master doesn't already provide them.
 *
 * The map keys are matched against a normalised query string built from
 * the product name (lowercased, no diacritics, first significant word).
 */

export type Exposure = 'soleil' | 'mi-ombre' | 'ombre';

export interface CulturalData {
  exposure?: Exposure;
  /** Months (1-12) suitable for sowing in metropolitan France. */
  sowingMonths?: number[];
  /** Months suitable for harvesting. */
  harvestMonths?: number[];
  /** Spacing between plants (cm). */
  spacingCm?: number;
  /** Mature height (cm) — useful for tomatoes / climbers. */
  heightCm?: number;
  waterNeed?: 'faible' | 'moyen' | 'élevé';
  /** Days from sowing to first harvest. */
  daysToHarvest?: number;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim();

const MAP: Record<string, CulturalData> = {
  tomate: { exposure: 'soleil', sowingMonths: [3, 4, 5], harvestMonths: [7, 8, 9, 10], spacingCm: 60, heightCm: 180, waterNeed: 'moyen', daysToHarvest: 75 },
  carotte: { exposure: 'soleil', sowingMonths: [3, 4, 5, 6, 7], harvestMonths: [6, 7, 8, 9, 10], spacingCm: 5, heightCm: 30, waterNeed: 'moyen', daysToHarvest: 90 },
  courgette: { exposure: 'soleil', sowingMonths: [4, 5], harvestMonths: [7, 8, 9, 10], spacingCm: 100, heightCm: 60, waterNeed: 'élevé', daysToHarvest: 55 },
  concombre: { exposure: 'soleil', sowingMonths: [4, 5], harvestMonths: [7, 8, 9], spacingCm: 80, heightCm: 200, waterNeed: 'élevé', daysToHarvest: 60 },
  laitue: { exposure: 'mi-ombre', sowingMonths: [3, 4, 5, 6, 7, 8, 9], harvestMonths: [5, 6, 7, 8, 9, 10], spacingCm: 25, heightCm: 25, waterNeed: 'moyen', daysToHarvest: 50 },
  radis: { exposure: 'soleil', sowingMonths: [3, 4, 5, 6, 7, 8, 9], harvestMonths: [4, 5, 6, 7, 8, 9, 10], spacingCm: 5, heightCm: 15, waterNeed: 'moyen', daysToHarvest: 30 },
  poivron: { exposure: 'soleil', sowingMonths: [2, 3], harvestMonths: [7, 8, 9, 10], spacingCm: 50, heightCm: 90, waterNeed: 'moyen', daysToHarvest: 100 },
  aubergine: { exposure: 'soleil', sowingMonths: [2, 3], harvestMonths: [7, 8, 9, 10], spacingCm: 60, heightCm: 100, waterNeed: 'élevé', daysToHarvest: 110 },
  basilic: { exposure: 'soleil', sowingMonths: [4, 5, 6], harvestMonths: [6, 7, 8, 9, 10], spacingCm: 25, heightCm: 40, waterNeed: 'moyen', daysToHarvest: 60 },
  haricot: { exposure: 'soleil', sowingMonths: [4, 5, 6, 7], harvestMonths: [7, 8, 9, 10], spacingCm: 30, heightCm: 200, waterNeed: 'moyen', daysToHarvest: 60 },
  epinard: { exposure: 'mi-ombre', sowingMonths: [2, 3, 4, 8, 9], harvestMonths: [4, 5, 6, 10, 11], spacingCm: 15, heightCm: 30, waterNeed: 'moyen', daysToHarvest: 50 },
  mache: { exposure: 'mi-ombre', sowingMonths: [7, 8, 9], harvestMonths: [10, 11, 12, 1, 2, 3], spacingCm: 10, heightCm: 10, waterNeed: 'faible', daysToHarvest: 70 },
  poireau: { exposure: 'soleil', sowingMonths: [2, 3, 4, 5, 6], harvestMonths: [9, 10, 11, 12, 1, 2, 3], spacingCm: 15, heightCm: 50, waterNeed: 'moyen', daysToHarvest: 150 },
  oignon: { exposure: 'soleil', sowingMonths: [9, 10, 2, 3], harvestMonths: [6, 7, 8, 9], spacingCm: 12, heightCm: 30, waterNeed: 'faible', daysToHarvest: 130 },
  ail: { exposure: 'soleil', sowingMonths: [10, 11, 2, 3], harvestMonths: [6, 7, 8], spacingCm: 12, heightCm: 30, waterNeed: 'faible', daysToHarvest: 200 },
  courge: { exposure: 'soleil', sowingMonths: [4, 5], harvestMonths: [9, 10, 11], spacingCm: 150, heightCm: 50, waterNeed: 'moyen', daysToHarvest: 110 },
  fraise: { exposure: 'soleil', sowingMonths: [3, 4, 9, 10], harvestMonths: [5, 6, 7], spacingCm: 30, heightCm: 25, waterNeed: 'moyen' },
  betterave: { exposure: 'soleil', sowingMonths: [3, 4, 5, 6], harvestMonths: [6, 7, 8, 9, 10], spacingCm: 15, heightCm: 35, waterNeed: 'moyen', daysToHarvest: 90 },
  navet: { exposure: 'soleil', sowingMonths: [3, 4, 7, 8], harvestMonths: [5, 6, 9, 10], spacingCm: 15, heightCm: 30, waterNeed: 'moyen', daysToHarvest: 70 },
  persil: { exposure: 'mi-ombre', sowingMonths: [3, 4, 5, 6, 7, 8], harvestMonths: [5, 6, 7, 8, 9, 10], spacingCm: 20, heightCm: 30, waterNeed: 'moyen', daysToHarvest: 80 },
};

export function findCulturalData(name: string, attributes?: Record<string, unknown> | null): CulturalData | null {
  // Prefer explicit attributes from the database when present.
  const fromAttrs: CulturalData = {};
  if (attributes && typeof attributes === 'object') {
    const a = attributes as Record<string, unknown>;
    if (a.exposure) fromAttrs.exposure = a.exposure as Exposure;
    if (Array.isArray(a.sowingMonths)) fromAttrs.sowingMonths = a.sowingMonths as number[];
    if (Array.isArray(a.harvestMonths)) fromAttrs.harvestMonths = a.harvestMonths as number[];
    if (typeof a.spacingCm === 'number') fromAttrs.spacingCm = a.spacingCm;
    if (typeof a.heightCm === 'number') fromAttrs.heightCm = a.heightCm;
    if (a.waterNeed) fromAttrs.waterNeed = a.waterNeed as CulturalData['waterNeed'];
    if (typeof a.daysToHarvest === 'number') fromAttrs.daysToHarvest = a.daysToHarvest;
  }

  // Fallback: match by first significant word of the product name.
  const nm = norm(name);
  const words = nm.split(/\s+/).filter((w) => w.length >= 3);
  for (const w of words) {
    const m = MAP[w];
    if (m) return { ...m, ...fromAttrs };
  }
  return Object.keys(fromAttrs).length ? fromAttrs : null;
}

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
export function monthsToString(months?: number[]): string {
  if (!months || months.length === 0) return '—';
  return months.map((m) => MONTH_LABELS[m - 1]).join(', ');
}
