/**
 * Prix marché de référence (€/kg) par famille — moyennes constatées
 * en grande surface française pour estimer les économies du potager.
 *
 * Indicatif et ajustable au cas par cas dans le formulaire de saisie.
 */
export const DEFAULT_PRICE_PER_KG: Record<string, number> = {
  fruits: 3,        // tomates, courgettes, concombres, aubergines, poivrons…
  leaves: 5,        // laitues, épinards, choux, mâche, roquette
  roots: 2.5,       // carottes, radis, betteraves, panais
  bulbs: 4,         // oignons, ail, échalotes, poireaux
  tubers: 2,        // pommes de terre, topinambours
  seeds: 7,         // haricots, pois, lentilles
  stems: 5,         // rhubarbe, asperges, céleri-branche
  aromatics: 50,    // basilic, persil, ciboulette (souvent vendus au sachet 5€/100g)
  flowers: 30,      // fleurs comestibles
  accessories: 0,   // n/a
};

export function getDefaultPrice(category: string): number {
  return DEFAULT_PRICE_PER_KG[category] ?? 3;
}
