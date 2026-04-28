/**
 * Définitions des familles utilisées dans l'étal — couleurs, emojis et
 * libellés alignés sur l'app mobile Kultiva (lib/utils/category_colors.dart
 * + lib/models/vegetable.dart côté Flutter).
 */

export type CategoryKey =
  | 'fruits'
  | 'leaves'
  | 'roots'
  | 'bulbs'
  | 'tubers'
  | 'flowers'
  | 'seeds'
  | 'stems'
  | 'aromatics'
  | 'accessories';

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  emoji: string;
  color: string; // hex de la couleur famille (familyColor côté Flutter)
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'fruits', label: 'Fruits', emoji: '🍅', color: '#E8A87C' },
  { key: 'leaves', label: 'Feuilles', emoji: '🥬', color: '#4A9B5A' },
  { key: 'roots', label: 'Racines', emoji: '🥕', color: '#8B6914' },
  { key: 'bulbs', label: 'Bulbes', emoji: '🧅', color: '#B39DDB' },
  { key: 'tubers', label: 'Tubercules', emoji: '🥔', color: '#795548' },
  { key: 'flowers', label: 'Fleurs', emoji: '🌸', color: '#E8A8C7' },
  { key: 'seeds', label: 'Graines', emoji: '🫘', color: '#D4A847' },
  { key: 'stems', label: 'Tiges', emoji: '🌿', color: '#66BB6A' },
  { key: 'aromatics', label: 'Aromatiques', emoji: '🌿', color: '#26A69A' },
  { key: 'accessories', label: 'Accessoires', emoji: '🧰', color: '#78909C' },
];

const BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]));

export function getCategoryDef(key: string): CategoryDef | null {
  return BY_KEY.get(key as CategoryKey) ?? null;
}

export function getCategoryColor(key: string): string {
  return getCategoryDef(key)?.color ?? '#78909C';
}

export function getCategoryLabel(key: string): string {
  return getCategoryDef(key)?.label ?? key;
}

export function getCategoryEmoji(key: string): string {
  return getCategoryDef(key)?.emoji ?? '🌱';
}
