import { KULTIVA_APP_URL } from '@/lib/utils';

export function CTAKultiva({ context }: { context?: string }) {
  const href = new URL(KULTIVA_APP_URL);
  href.searchParams.set('utm_source', 'kultivaprix');
  href.searchParams.set('utm_medium', 'cta');
  if (context) href.searchParams.set('utm_campaign', context);

  return (
    <aside
      className="rounded-bubble p-8 md:p-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FBD8E6 0%, #FFE7A0 50%, #A8D5A2 100%)' }}
    >
      <div className="relative z-10 grid gap-6 md:grid-cols-[1.6fr_1fr] items-center">
        <div>
          <span className="kicker">🌱 Ton copain potager</span>
          <h3 className="font-display text-2xl md:text-3xl font-bold mt-3 mb-2 text-fg">
            Planifie ton potager dans l&apos;appli <em className="hero-em">Kultiva</em>
          </h3>
          <p className="font-body text-fg/80 leading-relaxed max-w-lg">
            Calendrier de semis adapté à ta région, rotations automatiques, alertes météo et un
            Poussidex qui grandit avec toi. Gratuit pour commencer.
          </p>
        </div>
        <div className="flex md:justify-end">
          <a className="btn-primary" href={href.toString()} target="_blank" rel="noopener noreferrer">
            Ouvrir Kultiva <span className="text-lg">→</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
