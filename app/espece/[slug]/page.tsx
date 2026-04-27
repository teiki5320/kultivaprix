import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CTAKultiva } from '@/components/CTAKultiva';

export const revalidate = 21600;

interface SpeciesRow {
  slug: string;
  kind: 'species' | 'accessory';
  name: string;
  emoji: string | null;
  category: string;
  image_url: string | null;
  description: string | null;
  note: string | null;
  sowing_technique: string | null;
  sowing_depth: string | null;
  germination_temp: string | null;
  germination_days: string | null;
  exposure: string | null;
  spacing: string | null;
  watering: string | null;
  soil: string | null;
  yield_estimate: string | null;
  harvest_time_by_season: Record<string, string> | null;
  regions: Record<string, unknown> | null;
}

async function getSpecies(slug: string): Promise<SpeciesRow | null> {
  const { data } = await supabase
    .schema('public')
    .from('species')
    .select(
      'slug, kind, name, emoji, category, image_url, description, note, sowing_technique, sowing_depth, germination_temp, germination_days, exposure, spacing, watering, soil, yield_estimate, harvest_time_by_season, regions',
    )
    .eq('slug', slug)
    .eq('kind', 'species')
    .maybeSingle();
  return (data as SpeciesRow | null) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sp = await getSpecies(params.slug);
  if (!sp) return {};
  const description =
    sp.description?.slice(0, 160) ??
    `Fiche culture ${sp.name} : semis, exposition, récolte et offres marchands suivies.`;
  const canonical = `/espece/${sp.slug}`;
  return {
    title: sp.name,
    description,
    alternates: { canonical },
    openGraph: { title: sp.name, description, url: canonical },
  };
}

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-body font-bold uppercase tracking-wide text-fg-subtle">
        {label}
      </span>
      <span className="font-body text-sm text-fg">{value}</span>
    </div>
  );
}

const SEASON_LABELS: Record<string, string> = {
  spring: 'Printemps',
  summer: 'Été',
  autumn: 'Automne',
  winter: 'Hiver',
};

const REGION_LABELS: Record<string, string> = {
  france: 'France métropolitaine',
  west_africa: 'Afrique de l’Ouest',
};

export default async function SpeciesPage({ params }: { params: { slug: string } }) {
  const sp = await getSpecies(params.slug);
  if (!sp) notFound();

  const seasons = sp.harvest_time_by_season ?? {};
  const regions = sp.regions ?? {};

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumbs
        crumbs={[
          { name: 'Accueil', href: '/' },
          { name: sp.name, href: `/espece/${sp.slug}` },
        ]}
      />

      <header className="text-center pt-4">
        <span className="kicker">🌱 Fiche espèce</span>
        <div className="text-7xl mt-4">{sp.emoji ?? '🌱'}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-2">{sp.name}</h1>
        {sp.note && (
          <p className="mt-3 italic text-fg-muted max-w-2xl mx-auto">{sp.note}</p>
        )}
      </header>

      {sp.description && (
        <article className="prose max-w-none card-cream">
          {sp.description.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      )}

      <section className="card-cream">
        <h2 className="font-display text-xl font-bold text-fg mb-5">Au potager</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <Fact label="Exposition" value={sp.exposure} />
          <Fact label="Espacement" value={sp.spacing} />
          <Fact label="Arrosage" value={sp.watering} />
          <Fact label="Sol" value={sp.soil} />
          <Fact label="Rendement" value={sp.yield_estimate} />
        </div>
      </section>

      {(sp.sowing_technique || sp.sowing_depth || sp.germination_temp || sp.germination_days) && (
        <section className="card-cream">
          <h2 className="font-display text-xl font-bold text-fg mb-5">Semis et germination</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Fact label="Technique" value={sp.sowing_technique} />
            <Fact label="Profondeur" value={sp.sowing_depth} />
            <Fact label="Température" value={sp.germination_temp} />
            <Fact label="Délai" value={sp.germination_days} />
          </div>
        </section>
      )}

      {Object.keys(seasons).length > 0 && (
        <section className="card-cream">
          <h2 className="font-display text-xl font-bold text-fg mb-5">Quand récolter</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(seasons).map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <span className="text-[11px] font-body font-bold uppercase tracking-wide text-fg-subtle">
                  {SEASON_LABELS[k] ?? k}
                </span>
                <span className="font-body text-sm text-fg">{v}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.keys(regions).length > 0 && (
        <section className="card-cream">
          <h2 className="font-display text-xl font-bold text-fg mb-5">Selon ta région</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {Object.entries(regions).map(([k, v]) => (
              <div key={k} className="flex flex-col gap-2">
                <span className="font-display font-bold text-fg">{REGION_LABELS[k] ?? k}</span>
                <pre className="font-body text-sm text-fg whitespace-pre-wrap">
                  {typeof v === 'string' ? v : JSON.stringify(v, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card-cream text-center">
        <h2 className="font-display text-xl font-bold text-fg mb-3">Comparer les prix marchands</h2>
        <p className="text-fg-muted">
          On suit les prix chez les marchands jardinage français. Le tableau s'affichera ici dès que
          les premières offres seront référencées.
        </p>
      </section>

      <CTAKultiva context={`espece-${sp.slug}`} />
    </div>
  );
}
