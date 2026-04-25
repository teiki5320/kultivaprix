/**
 * Companion planting — which veggies grow well next to which.
 * Data is hand-curated from common French permaculture references.
 */

export interface Companions {
  good: string[];
  bad: string[];
}

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').trim();

const MAP: Record<string, Companions> = {
  tomate: { good: ['Basilic', 'Œillet d\'Inde', 'Persil', 'Carotte'], bad: ['Pomme de terre', 'Fenouil', 'Chou'] },
  carotte: { good: ['Poireau', 'Oignon', 'Tomate', 'Romarin'], bad: ['Aneth', 'Fenouil'] },
  courgette: { good: ['Capucine', 'Maïs', 'Haricot'], bad: ['Concombre'] },
  concombre: { good: ['Aneth', 'Capucine', 'Maïs'], bad: ['Pomme de terre', 'Sauge'] },
  laitue: { good: ['Carotte', 'Radis', 'Fraisier'], bad: ['Persil'] },
  radis: { good: ['Carotte', 'Laitue', 'Cerfeuil'], bad: ['Hysope'] },
  poivron: { good: ['Basilic', 'Tomate', 'Carotte'], bad: ['Fenouil'] },
  aubergine: { good: ['Basilic', 'Haricot', 'Capucine'], bad: ['Pomme de terre'] },
  basilic: { good: ['Tomate', 'Poivron', 'Aubergine'], bad: [] },
  haricot: { good: ['Maïs', 'Courgette', 'Carotte', 'Pomme de terre'], bad: ['Ail', 'Oignon'] },
  epinard: { good: ['Fraisier', 'Haricot', 'Pois'], bad: [] },
  mache: { good: ['Carotte', 'Mâche en intercalaire'], bad: [] },
  poireau: { good: ['Carotte', 'Fraisier', 'Tomate'], bad: ['Haricot', 'Pois'] },
  oignon: { good: ['Carotte', 'Fraisier', 'Tomate', 'Betterave'], bad: ['Haricot', 'Pois'] },
  ail: { good: ['Fraisier', 'Tomate', 'Carotte'], bad: ['Haricot', 'Pois'] },
  courge: { good: ['Maïs', 'Haricot (les 3 sœurs)', 'Capucine'], bad: ['Pomme de terre'] },
  fraise: { good: ['Ail', 'Oignon', 'Poireau', 'Épinard'], bad: ['Chou'] },
  betterave: { good: ['Oignon', 'Chou', 'Haricot nain'], bad: ['Tomate'] },
  navet: { good: ['Pois', 'Menthe'], bad: [] },
  persil: { good: ['Tomate', 'Asperge'], bad: ['Laitue'] },
};

export function findCompanions(name: string): Companions | null {
  const words = norm(name).split(/\s+/).filter((w) => w.length >= 3);
  for (const w of words) {
    const m = MAP[w];
    if (m) return m;
  }
  return null;
}
