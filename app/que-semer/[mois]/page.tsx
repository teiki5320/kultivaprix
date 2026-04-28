import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CTAKultiva } from '@/components/CTAKultiva';
import { AddToKultivaPlanButton } from '@/components/AddToKultivaPlanButton';
import { PlantedThisMonth } from '@/components/PlantedThisMonth';
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
  const top = data.semer.slice(0, 3).map((s) => s.label).join(', ');
  const canonical = `/que-semer/${params.mois}`;
  const title = `Que semer en ${m} ?`;
  const description = top
    ? `${m} : ${top}… Calendrier de semis et prix comparés chez les marchands jardinage français.`
    : `Calendrier de semis ${m.toLowerCase()} pour la France métropolitaine.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

async function getProducts(queries: string[]) {
  if (!queries.length) return [];
  return [];
}

export default async function QueSemerPage({ params }: { params: { mois: string } }) {
  if (!isMonth(params.mois)) notFound();
  const mois = params.mois as Month;
  const m = monthLabel(mois);
  const data = CALENDAR[mois];

  const monthInfo = MONTHS.find((mm) => mm.slug === mois)!;
  const monthNumber = MONTHS.findIndex((mm) => mm.slug === mois) + 1;

  // FAQPage JSON-LD — long-tail SEO
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Que semer en ${m} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            `En ${m.toLowerCase()}, on peut semer ${data.semer.map((s) => s.label.toLowerCase()).join(', ')}. ` +
            `Le calendrier dépend de la région : commence sous abri dans le nord, en pleine terre dans le sud.`,
        },
      },
      {
        '@type': 'Question',
        name: `Que récolter en ${m} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            data.recolter.length
              ? `Récolte ce mois : ${data.recolter.map((r) => r.label.toLowerCase()).join(', ')}.`
              : `Peu de récoltes ce mois — c'est un mois de semis et d'attente.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Comment être sûr du bon moment selon ma région ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            "L'application Kultiva (gratuite) ajuste les dates au climat exact de ta région — métropole, outre-mer ou Afrique de l'Ouest.",
        },
      },
    ],
  };

  const itemList = itemListLd(
    `À semer en ${m}`,
    data.semer.map((s) => ({ slug: s.query, name: s.label })),
    '/recherche?q=',
  );

  return (
    <div className="flex flex-col gap-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <Breadcrumbs
        crumbs={[
          { name: 'Accueil', href: '/' },
          { name: 'Calendrier', href: `/que-semer/${mois}` },
          { name: m, href: `/que-semer/${mois}` },
        ]}
      />

      <header className="text-center pt-4">
        <span className="kicker">{monthInfo.emoji} Calendrier · {monthInfo.season}</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          Que semer en <em className="hero-em">{m}</em> ?
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          Variétés à semer ce mois en France métropolitaine. On t&apos;a sélectionné les graines
          et plants disponibles chez nos marchands suivis, classés par prix.
        </p>
        <div className="mt-5 flex justify-center">
          <AddToKultivaPlanButton month={monthNumber} campaign={`semer-${mois}`} label="Ouvrir mon calendrier Kultiva" />
        </div>
      </header>

      <section>
        <span className="kicker">🌱 À semer</span>
        <h2 className="font-display text-3xl font-bold mt-3 mb-4 text-fg">À semer ce mois-ci</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.semer.map((s) => (
            <Link
              key={s.query}
              href={`/recherche?q=${encodeURIComponent(s.query)}`}
              className="card-cream text-center no-underline transition hover:-translate-y-1 hover:shadow-leaf"
            >
              <div className="text-4xl">{s.emoji}</div>
              <div className="font-display font-bold text-base mt-2 text-fg">{s.label}</div>
              {s.note && <div className="text-xs text-fg-muted mt-1">{s.note}</div>}
            </Link>
          ))}
        </div>
      </section>

      {data.recolter.length > 0 && (
        <section>
          <span className="kicker kicker-terra">🧺 À récolter</span>
          <h2 className="font-display text-3xl font-bold mt-3 mb-4 text-fg">À récolter en {m}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.recolter.map((r) => (
              <div key={r.query} className="rounded-2xl bg-white px-4 py-3 text-center shadow-card border border-cream">
                <div className="text-3xl">{r.emoji}</div>
                <div className="font-display font-bold text-base mt-1 text-fg">{r.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <nav aria-label="Autres mois" className="card-cream">
        <span className="kicker">📅 Calendrier annuel</span>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
          {MONTHS.map((mm) => (
            <Link
              key={mm.slug}
              href={`/que-semer/${mm.slug}`}
              className={`rounded-xl px-3 py-2 text-center font-display font-bold text-sm transition no-underline ${
                mm.slug === mois ? 'text-white' : 'text-fg hover:bg-cream-warm'
              }`}
              style={mm.slug === mois ? { background: 'var(--brand)' } : { background: 'var(--cream-surface)' }}
            >
              {mm.label}
            </Link>
          ))}
        </div>
      </nav>

      <PlantedThisMonth />

      <CTAKultiva context={`que-semer-${mois}`} />
    </div>
  );
}
