import { KULTIVA_APP_URL } from '@/lib/utils';

export function CTAKultiva({ context }: { context?: string }) {
  const href = new URL(KULTIVA_APP_URL);
  href.searchParams.set('utm_source', 'kultivaprix');
  href.searchParams.set('utm_medium', 'cta');
  if (context) href.searchParams.set('utm_campaign', context);

  return (
    <aside className="card-kawaii border-kawaii-green-200 bg-kawaii-green-50">
      <p className="font-display text-xl text-kawaii-green-600 font-extrabold mb-1">
        🪴 Planifie ton potager dans l&apos;appli Kultiva
      </p>
      <p className="text-sm text-kawaii-ink/80 mb-3">
        Calendrier de semis adapté à ta région, rotations automatiques, alertes
        météo. Gratuit pour commencer.
      </p>
      <a className="btn-kawaii-green" href={href.toString()} target="_blank" rel="noopener noreferrer">
        Ouvrir Kultiva →
      </a>
    </aside>
  );
}
