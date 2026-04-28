import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glossaire jardinier',
  description: 'Tous les mots du potager expliqués simplement : semer, repiquer, pincer, butter, hybride F1, paillage, etc.',
  alternates: { canonical: '/glossaire' },
};

interface Term {
  term: string;
  short: string;
  body: string;
}

const TERMS: Term[] = [
  { term: 'Semis', short: 'Mettre les graines en terre', body: 'Action de mettre une graine en condition de germer, en pleine terre ou en godet. Le bon moment dépend de la variété et du climat de ta région.' },
  { term: 'Repiquer', short: 'Transplanter un jeune plant', body: 'Sortir un plant de son godet ou de sa terrine pour l\'installer dans le potager, généralement quand il a 4–6 vraies feuilles.' },
  { term: 'Éclaircir', short: 'Garder les plus vigoureux', body: 'Quand plusieurs graines ont levé trop près, on retire les plus faibles pour laisser le meilleur pousser sans concurrence.' },
  { term: 'Pincer', short: 'Couper l\'extrémité', body: 'Couper l\'extrémité d\'une tige (souvent sur tomate, basilic, courge) pour favoriser la ramification et la production.' },
  { term: 'Butter', short: 'Ramener la terre au pied', body: 'Remonter de la terre autour du pied d\'un légume (pomme de terre, poireau) pour blanchir, stabiliser ou produire plus.' },
  { term: 'Tuteurer', short: 'Aider à se tenir droit', body: 'Mettre un support (canne, ficelle) à un plant qui devient trop haut ou trop chargé en fruits.' },
  { term: 'Hybride F1', short: 'Variété issue d\'un croisement', body: 'Croisement entre deux lignées : très vigoureux la première année, mais les graines récoltées ne reproduisent pas les mêmes plants.' },
  { term: 'Reproductible', short: 'Graines à conserver', body: 'Variété ancienne ou paysanne dont les graines récoltées au potager redonneront un plant identique. À privilégier pour ressemer.' },
  { term: 'Paillage', short: 'Couvrir le sol', body: 'Couvrir le sol entre les plants (paille, BRF, tonte) pour limiter l\'évaporation, l\'arrosage et les mauvaises herbes.' },
  { term: 'Compagnonnage', short: 'Plantes qui s\'entraident', body: 'Associer des cultures qui se rendent service : carotte + poireau, basilic + tomate, capucine + courge.' },
  { term: 'Rotation', short: 'Changer d\'emplacement', body: 'Ne pas planter la même famille (solanacées, cucurbitacées…) deux années de suite au même endroit pour éviter d\'épuiser le sol.' },
  { term: 'Bisannuel', short: 'Cycle sur 2 ans', body: 'Plante qui pousse la première année et fleurit / monte en graines la deuxième (carotte, betterave, poireau).' },
  { term: 'Vivace', short: 'Repousse chaque année', body: 'Plante qui survit à l\'hiver et repart d\'elle-même au printemps (rhubarbe, ciboulette, asperge).' },
  { term: 'Annuel', short: 'Cycle d\'un an', body: 'Plante qui réalise tout son cycle (semis → graine) en une saison.' },
  { term: 'Châssis', short: 'Mini-serre au sol', body: 'Structure froide ou chaude pour protéger des semis hâtifs ou des cultures délicates en début et fin de saison.' },
  { term: 'Voile d\'hivernage', short: 'Tissu protège-froid', body: 'Tissu non-tissé léger qu\'on pose sur les cultures pour les protéger du gel, du vent et des insectes.' },
  { term: 'Bouturage', short: 'Multiplier sans semer', body: 'Faire raciner un fragment de tige pour obtenir un nouveau plant identique à la mère (basilic, sauge, romarin, manioc).' },
  { term: 'Mâche, scarole, frisée', short: 'Salades d\'hiver', body: 'Salades résistantes au froid qu\'on sème en fin d\'été pour récolter de novembre à mars.' },
];

export default function GlossairePage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="text-center pt-4">
        <span className="kicker">📚 Glossaire</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          Les mots du <em className="hero-em">potager</em>
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          Tout le vocabulaire du jardinage expliqué en une phrase, plus une mini fiche pour aller plus loin.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        {TERMS.sort((a, b) => a.term.localeCompare(b.term, 'fr')).map((t) => (
          <article key={t.term} className="card-cream">
            <div className="font-display font-bold text-xl text-fg">{t.term}</div>
            <div className="font-body font-bold text-sm mt-1" style={{ color: 'var(--brand-dark)' }}>{t.short}</div>
            <p className="font-body text-fg-muted text-sm mt-2 leading-relaxed">{t.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
