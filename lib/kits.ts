/**
 * Hand-curated "starter kits" — pre-built carts you can import in one click.
 * Each kit is a short-list of search queries (`q`); the kit page resolves
 * them to the cheapest matching products from the catalogue.
 */

export interface Kit {
  slug: string;
  name: string;
  emoji: string;
  pitch: string;
  audience: string;
  queries: string[];
}

export const KITS: Kit[] = [
  {
    slug: 'premier-potager',
    name: 'Mon premier potager',
    emoji: '🌱',
    pitch: 'Pour démarrer doucement avec 6 variétés tolérantes et productives.',
    audience: 'Débutant·e · 5–10 m²',
    queries: ['tomate cerise', 'radis', 'laitue', 'basilic', 'courgette', 'haricot vert'],
  },
  {
    slug: 'balcon-ensoleille',
    name: 'Balcon ensoleillé',
    emoji: '🌞',
    pitch: 'Tout en pots, gourmand de soleil, peu de profondeur de terre.',
    audience: 'Balcon · 3–5 pots',
    queries: ['tomate cerise', 'basilic', 'persil', 'fraise', 'menthe'],
  },
  {
    slug: 'salades-quatre-saisons',
    name: 'Salades 4 saisons',
    emoji: '🥬',
    pitch: 'Mâche, laitue, roquette, scarole — tu manges du frais toute l’année.',
    audience: 'Petit potager · 3 m²',
    queries: ['mache', 'laitue', 'roquette', 'scarole', 'epinard'],
  },
  {
    slug: 'kit-aromatiques',
    name: 'Aromatiques essentielles',
    emoji: '🌿',
    pitch: 'Six aromatiques qui transforment toute cuisine du quotidien.',
    audience: 'Tous niveaux',
    queries: ['basilic', 'persil', 'ciboulette', 'thym', 'romarin', 'menthe'],
  },
  {
    slug: 'tropical-afrique-ouest',
    name: 'Potager tropical',
    emoji: '🌍',
    pitch: 'Variétés adaptées au climat sahélien et soudanien.',
    audience: 'Afrique de l’Ouest',
    queries: ['gombo', 'niebe', 'aubergine africaine', 'pasteque', 'bissap'],
  },
];

export function findKit(slug: string): Kit | undefined {
  return KITS.find((k) => k.slug === slug);
}
