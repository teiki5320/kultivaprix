import Link from 'next/link';

export const metadata = { title: 'Désinscription' };

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { ok?: string; error?: string; type?: string };
}) {
  const { ok, error, type } = searchParams;
  const ko = error || !ok;
  return (
    <div className="flex flex-col items-center text-center py-16 gap-5 max-w-md mx-auto">
      <div className="text-6xl">{ko ? '🌧' : '🌿'}</div>
      <h1 className="font-display text-3xl font-bold text-fg">
        {ko ? 'Hum…' : type === 'newsletter' ? 'Newsletter arrêtée' : 'Alerte supprimée'}
      </h1>
      <p className="font-body text-fg-muted">
        {ko
          ? "On n'a pas pu trouver ce lien. Il a peut-être déjà été utilisé."
          : 'C’est fait. Aucun email ne sera plus envoyé. Tu peux revenir quand tu veux.'}
      </p>
      <Link href="/" className="btn-primary">
        Retour à l’accueil →
      </Link>
    </div>
  );
}
