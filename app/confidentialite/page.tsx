export const metadata = {
  title: 'Confidentialité',
  description: 'Quelles données on collecte (presque rien), comment elles sont anonymisées, et nos engagements RGPD.',
  alternates: { canonical: '/confidentialite' },
};

export default function Confidentialite() {
  return (
    <article className="card-cream prose max-w-none">
      <h1 className="font-display text-4xl font-bold text-fg">Confidentialité</h1>
      <p>
        Kultivaprix ne collecte aucune donnée personnelle nominative. Lors d&apos;un clic sur un lien
        marchand, nous enregistrons un hash anonyme (IP + User-Agent) pour prévenir la fraude au clic
        et mesurer le trafic global. Ces données ne permettent pas de te ré-identifier.
      </p>
      <p>
        Aucun cookie publicitaire n&apos;est posé sur le site hors redirection vers les marchands.
      </p>
    </article>
  );
}
