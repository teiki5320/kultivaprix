/**
 * Static sowing/harvest calendar for the French "métropole tempéré"
 * climate. Used as the default for seasonal landing pages
 * (/que-semer/[mois], /que-recolter/[mois]).
 *
 * Data is intentionally hand-curated — small enough to maintain by
 * hand, big enough for SEO long-tail traffic. Region-specific
 * variants can be layered on later via a `region` parameter.
 */

export type Month =
  | 'janvier' | 'fevrier' | 'mars' | 'avril' | 'mai' | 'juin'
  | 'juillet' | 'aout' | 'septembre' | 'octobre' | 'novembre' | 'decembre';

export const MONTHS: { slug: Month; label: string; emoji: string; season: 'hiver' | 'printemps' | 'ete' | 'automne' }[] = [
  { slug: 'janvier',   label: 'Janvier',   emoji: '❄️', season: 'hiver' },
  { slug: 'fevrier',   label: 'Février',   emoji: '❄️', season: 'hiver' },
  { slug: 'mars',      label: 'Mars',      emoji: '🌱', season: 'printemps' },
  { slug: 'avril',     label: 'Avril',     emoji: '🌷', season: 'printemps' },
  { slug: 'mai',       label: 'Mai',       emoji: '🌸', season: 'printemps' },
  { slug: 'juin',      label: 'Juin',      emoji: '☀️', season: 'ete' },
  { slug: 'juillet',   label: 'Juillet',   emoji: '☀️', season: 'ete' },
  { slug: 'aout',      label: 'Août',      emoji: '🌻', season: 'ete' },
  { slug: 'septembre', label: 'Septembre', emoji: '🍂', season: 'automne' },
  { slug: 'octobre',   label: 'Octobre',   emoji: '🍁', season: 'automne' },
  { slug: 'novembre',  label: 'Novembre',  emoji: '🍄', season: 'automne' },
  { slug: 'decembre',  label: 'Décembre',  emoji: '❄️', season: 'hiver' },
];

export interface CalendarEntry {
  /** Lowercase, no diacritics — used to match product names with .ilike */
  query: string;
  /** Display label */
  label: string;
  emoji: string;
  /** Optional cultural note */
  note?: string;
}

interface MonthlyCalendar {
  semer: CalendarEntry[];
  recolter: CalendarEntry[];
}

export const CALENDAR: Record<Month, MonthlyCalendar> = {
  janvier: {
    semer: [
      { query: 'oignon', label: 'Oignon', emoji: '🧅', note: 'Sous abri' },
      { query: 'echalote', label: 'Échalote', emoji: '🧄', note: 'En pleine terre' },
      { query: 'feve', label: 'Fève', emoji: '🫘', note: 'Régions douces' },
    ],
    recolter: [
      { query: 'mache', label: 'Mâche', emoji: '🥬' },
      { query: 'poireau', label: 'Poireau', emoji: '🥬' },
      { query: 'chou_pomme', label: 'Chou', emoji: '🥬' },
      { query: 'epinard', label: 'Épinard', emoji: '🥬' },
    ],
  },
  fevrier: {
    semer: [
      { query: 'aubergine', label: 'Aubergine', emoji: '🍆', note: 'Sous abri chauffé' },
      { query: 'poivron', label: 'Poivron', emoji: '🫑', note: 'Sous abri chauffé' },
      { query: 'tomate', label: 'Tomate', emoji: '🍅', note: 'Sous abri chauffé' },
      { query: 'laitue', label: 'Laitue', emoji: '🥬', note: 'Sous chassis' },
    ],
    recolter: [
      { query: 'mache', label: 'Mâche', emoji: '🥬' },
      { query: 'poireau', label: 'Poireau', emoji: '🥬' },
      { query: 'epinard', label: 'Épinard', emoji: '🥬' },
    ],
  },
  mars: {
    semer: [
      { query: 'carotte', label: 'Carotte', emoji: '🥕' },
      { query: 'radis', label: 'Radis', emoji: '🌶️' },
      { query: 'petit_pois', label: 'Petit pois', emoji: '🫛' },
      { query: 'epinard', label: 'Épinard', emoji: '🥬' },
      { query: 'laitue', label: 'Laitue', emoji: '🥬' },
      { query: 'persil', label: 'Persil', emoji: '🌿' },
    ],
    recolter: [
      { query: 'mache', label: 'Mâche', emoji: '🥬' },
      { query: 'poireau', label: 'Poireau', emoji: '🥬' },
      { query: 'radis', label: 'Radis de printemps', emoji: '🌶️', note: 'Premiers radis hâtifs' },
    ],
  },
  avril: {
    semer: [
      { query: 'haricot', label: 'Haricot vert', emoji: '🫛', note: 'Après les saintes glaces' },
      { query: 'courgette', label: 'Courgette', emoji: '🥒', note: 'En godet' },
      { query: 'concombre', label: 'Concombre', emoji: '🥒', note: 'En godet' },
      { query: 'mais', label: 'Maïs doux', emoji: '🌽' },
      { query: 'betterave', label: 'Betterave', emoji: '🥕' },
      { query: 'navet', label: 'Navet', emoji: '🥔' },
      { query: 'basilic', label: 'Basilic', emoji: '🌿', note: 'En godet à l’abri' },
    ],
    recolter: [
      { query: 'radis', label: 'Radis', emoji: '🌶️' },
      { query: 'asperge', label: 'Asperge', emoji: '🌱' },
      { query: 'laitue', label: 'Laitue de printemps', emoji: '🥬' },
    ],
  },
  mai: {
    semer: [
      { query: 'tomate', label: 'Tomate', emoji: '🍅', note: 'Plantation après mi-mai' },
      { query: 'courgette', label: 'Courgette', emoji: '🥒' },
      { query: 'concombre', label: 'Concombre', emoji: '🥒' },
      { query: 'aubergine', label: 'Aubergine', emoji: '🍆' },
      { query: 'poivron', label: 'Poivron', emoji: '🫑' },
      { query: 'haricot', label: 'Haricot', emoji: '🫛' },
      { query: 'basilic', label: 'Basilic', emoji: '🌿' },
    ],
    recolter: [
      { query: 'radis', label: 'Radis', emoji: '🌶️' },
      { query: 'asperge', label: 'Asperge', emoji: '🌱' },
      { query: 'fraise', label: 'Fraise', emoji: '🍓' },
    ],
  },
  juin: {
    semer: [
      { query: 'haricot', label: 'Haricot', emoji: '🫛' },
      { query: 'carotte', label: 'Carotte', emoji: '🥕' },
      { query: 'chou_pomme', label: 'Chou d’hiver', emoji: '🥬' },
      { query: 'poireau', label: 'Poireau d’hiver', emoji: '🥬' },
      { query: 'navet', label: 'Navet d’automne', emoji: '🥔' },
    ],
    recolter: [
      { query: 'fraise', label: 'Fraise', emoji: '🍓' },
      { query: 'petit_pois', label: 'Petit pois', emoji: '🫛' },
      { query: 'laitue', label: 'Salade', emoji: '🥬' },
    ],
  },
  juillet: {
    semer: [
      { query: 'mache', label: 'Mâche', emoji: '🥬' },
      { query: 'epinard', label: 'Épinard d’hiver', emoji: '🥬' },
      { query: 'haricot', label: 'Haricot tardif', emoji: '🫛' },
      { query: 'chou_pomme', label: 'Chou de printemps', emoji: '🥬' },
    ],
    recolter: [
      { query: 'tomate', label: 'Tomate', emoji: '🍅', note: 'Pic de la saison' },
      { query: 'courgette', label: 'Courgette', emoji: '🥒' },
      { query: 'haricot', label: 'Haricot', emoji: '🫛' },
      { query: 'concombre', label: 'Concombre', emoji: '🥒' },
      { query: 'aubergine', label: 'Aubergine', emoji: '🍆' },
    ],
  },
  aout: {
    semer: [
      { query: 'mache', label: 'Mâche', emoji: '🥬' },
      { query: 'epinard', label: 'Épinard', emoji: '🥬' },
      { query: 'radis', label: 'Radis d’hiver', emoji: '🌶️' },
      { query: 'navet', label: 'Navet', emoji: '🥔' },
    ],
    recolter: [
      { query: 'tomate', label: 'Tomate', emoji: '🍅' },
      { query: 'courgette', label: 'Courgette', emoji: '🥒' },
      { query: 'aubergine', label: 'Aubergine', emoji: '🍆' },
      { query: 'poivron', label: 'Poivron', emoji: '🫑' },
      { query: 'mais', label: 'Maïs doux', emoji: '🌽' },
    ],
  },
  septembre: {
    semer: [
      { query: 'mache', label: 'Mâche', emoji: '🥬' },
      { query: 'oignon', label: 'Oignon blanc', emoji: '🧅' },
      { query: 'epinard', label: 'Épinard', emoji: '🥬' },
      { query: 'radis', label: 'Radis d’hiver', emoji: '🌶️' },
    ],
    recolter: [
      { query: 'tomate', label: 'Tomate', emoji: '🍅' },
      { query: 'courge_butternut', label: 'Courge', emoji: '🎃' },
      { query: 'pomme_de_terre', label: 'Pomme de terre tardive', emoji: '🥔' },
      { query: 'poireau', label: 'Poireau', emoji: '🥬' },
    ],
  },
  octobre: {
    semer: [
      { query: 'ail', label: 'Ail', emoji: '🧄' },
      { query: 'echalote', label: 'Échalote', emoji: '🧄' },
      { query: 'feve', label: 'Fève d’hiver', emoji: '🫘' },
      { query: 'mache', label: 'Mâche', emoji: '🥬' },
    ],
    recolter: [
      { query: 'courge_butternut', label: 'Potimarron / courge', emoji: '🎃' },
      { query: 'chou_pomme', label: 'Chou', emoji: '🥬' },
      { query: 'poireau', label: 'Poireau', emoji: '🥬' },
      { query: 'mache', label: 'Mâche', emoji: '🥬' },
    ],
  },
  novembre: {
    semer: [
      { query: 'ail', label: 'Ail', emoji: '🧄' },
      { query: 'feve', label: 'Fève', emoji: '🫘' },
    ],
    recolter: [
      { query: 'poireau', label: 'Poireau', emoji: '🥬' },
      { query: 'mache', label: 'Mâche', emoji: '🥬' },
      { query: 'chou_pomme', label: 'Chou', emoji: '🥬' },
      { query: 'topinambour', label: 'Topinambour', emoji: '🥔' },
    ],
  },
  decembre: {
    semer: [
      { query: 'oignon', label: 'Oignon', emoji: '🧅', note: 'Régions douces' },
    ],
    recolter: [
      { query: 'mache', label: 'Mâche', emoji: '🥬' },
      { query: 'poireau', label: 'Poireau', emoji: '🥬' },
      { query: 'chou_pomme', label: 'Chou', emoji: '🥬' },
      { query: 'topinambour', label: 'Topinambour', emoji: '🥔' },
    ],
  },
};

export function isMonth(slug: string): slug is Month {
  return MONTHS.some((m) => m.slug === slug);
}

export function monthLabel(slug: Month): string {
  return MONTHS.find((m) => m.slug === slug)!.label;
}
