export const metadata = {
  title: 'Mentions légales',
  description: 'Éditeur, hébergement, programme d’affiliation : informations légales du comparateur Kultivaprix.',
  alternates: { canonical: '/mentions-legales' },
};

export default function MentionsLegales() {
  return (
    <article className="card-cream prose max-w-none">
      <h1 className="font-display text-4xl font-bold text-fg">Mentions légales</h1>
      <h2>Éditeur</h2>
      <p>Kultivaprix est édité par <strong>[Raison sociale à compléter]</strong>, [adresse], RCS [ville] n° [numéro].</p>
      <h2>Hébergement</h2>
      <p>Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.</p>
      <h2>Affiliation</h2>
      <p>Kultivaprix participe à différents programmes d&apos;affiliation. Les liens marchands sont des liens sponsorisés.</p>
    </article>
  );
}
