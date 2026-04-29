import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CTAKultiva } from '@/components/CTAKultiva';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { itemListLd } from '@/lib/jsonld';
import { CALENDAR, MONTHS, isMonth, monthLabel, type Month } from '@/lib/calendar';

export const revalidate = 86400;

export async function generateStaticParams() {
  return MONTHS.map((m) => ({ mois: m.slug }));
}

export async function generateMetadata({ params }: { params: { mois: string } }): Promise<Metadata> {
  if (!isMonth(params.mois)) return {};
  const m = monthLabel(params.mois);
  const data = CALENDAR[params.mois as Month];
  const top = data.recolter.slice(0, 3).map((s) => s.label).join(', ');
  const canonical = `/que-recolter/${params.mois}`;
  const title = `Que récolter en ${m} ?`;
  const description = top
    ? `${m} : on récolte ${top}… Idées potager et signes de maturité.`
    : `Calendrier de récolte ${m.toLowerCase()} pour la France.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default function QueRecolterPage({ params }: { params: { mois: string } }) {
  if (!isMonth(params.mois)) notFound();
  const mois = params.mois as Month;
  const m = monthLabel(mois);
  const data = CALENDAR[mois];
  const monthInfo = MONTHS.find((mm) => mm.slug === mois)!;

  const itemList = itemListLd(
    `À récolter en ${m}`,
    data.recolter.map((s) => ({ slug: s.query, name: s.label })),
    '/espece/',
  );

  return (
    <div className="flex flex-col gap-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <Breadcrumbs
        crumbs={[
          { name: 'Accueil', href: '/' },
          { name: 'Récolte', href: `/que-recolter/${mois}` },
          { name: m, href: `/que-recolter/${mois}` },
        ]}
      />
      <header className="text-center pt-4">
        <span className="kicker kicker-terra">{monthInfo.emoji} Récolte · {monthInfo.season}</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          Que récolter en <em className="hero-em">{m}</em> ?
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          Variétés à cueillir ce mois en France métropolitaine.
        </p>
      </header>

      {data.recolter.length > 0 ? (
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.recolter.map((r) => (
              <Link
                key={r.query}
                href={`/espece/${r.query}`}
                className="card-cream text-center no-underline transition hover:-translate-y-1 hover:shadow-leaf"
              >
                <div className="text-4xl">{r.emoji}</div>
                <div className="font-display font-bold text-base mt-2 text-fg">{r.label}</div>
                {r.note && <div className="text-xs text-fg-muted mt-1">{r.note}</div>}
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="card-cream text-center text-fg-muted">
          Peu de récoltes ce mois — c&apos;est plutôt un mois de semis et d&apos;attente.
        </div>
      )}

      <section>
        <span className="kicker">🌱 Pendant que ça pousse, on sème</span>
        <h2 className="font-display text-3xl font-bold mt-3 mb-4 text-fg">À semer en {m}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.semer.map((s) => (
            <Link
              key={s.query}
              href={`/espece/${s.query}`}
              className="rounded-2xl bg-white px-4 py-3 text-center shadow-card border border-cream no-underline hover:-translate-y-1 transition"
            >
              <div className="text-3xl">{s.emoji}</div>
              <div className="font-display font-bold text-base mt-1 text-fg">{s.label}</div>
            </Link>
          ))}
        </div>
      </section>

      <nav aria-label="Autres mois" className="card-cream">
        <span className="kicker kicker-terra">📅 Calendrier annuel</span>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
          {MONTHS.map((mm) => (
            <Link
              key={mm.slug}
              href={`/que-recolter/${mm.slug}`}
              className={`rounded-xl px-3 py-2 text-center font-display font-bold text-sm transition no-underline ${
                mm.slug === mois ? 'text-white' : 'text-fg hover:bg-cream-warm'
              }`}
              style={
                mm.slug === mois ? { background: 'var(--terracotta-deep)' } : { background: 'var(--cream-surface)' }
              }
            >
              {mm.label}
            </Link>
          ))}
        </div>
      </nav>

      <CTAKultiva context={`que-recolter-${mois}`} />
    </div>
  );
}
