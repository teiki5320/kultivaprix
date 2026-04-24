export const metadata = { title: 'Confidentialité' };

export default function Confidentialite() {
  return (
    <article className="card-kawaii prose max-w-none">
      <h1 className="font-display text-3xl font-extrabold text-kawaii-green-600">Confidentialité</h1>
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
