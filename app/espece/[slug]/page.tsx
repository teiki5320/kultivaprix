import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { CTAKultiva } from '@/components/CTAKultiva';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SpeciesCalendarBars } from '@/components/SpeciesCalendarBars';
import { SpeciesKeyValueCard } from '@/components/SpeciesKeyValueCard';
import { CompanionsCard } from '@/components/CompanionsCard';
import { AddToKultivaPlanButton } from '@/components/AddToKultivaPlanButton';
import { AmazonAffiliateInline, AmazonAffiliateButton } from '@/components/AmazonAffiliate';
import { getCategoryColor, getCategoryLabel } from '@/lib/etal-categories';
import { getPreferences } from '@/lib/preferences-server';

export const revalidate = 21600; // 6h ISR

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

// Dedicated client for the public schema (the default kultivaprix schema
// won't see the species table).
const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

interface Species {
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
  regions: {
    france?: { sowing_months?: number[]; harvest_months?: number[]; regional_note?: string | null };
    west_africa?: { sowing_months?: number[]; harvest_months?: number[]; regional_note?: string | null };
  } | null;
}

async function getSpecies(slug: string): Promise<Species | null> {
  const { data } = await publicClient
    .from('species')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return (data as Species) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sp = await getSpecies(params.slug);
  if (!sp || sp.kind !== 'species') return {};
  const description = sp.description?.slice(0, 160) ?? `Cultiver ${sp.name} : semis, exposition, récolte. Fiche espèce du catalogue Kultiva.`;
  const canonical = `/espece/${sp.slug}`;
  return {
    title: sp.name,
    description,
    alternates: { canonical },
    openGraph: { title: sp.name, description, url: canonical },
  };
}

export default async function SpeciesPage({ params }: { params: { slug: string } }) {
  const sp = await getSpecies(params.slug);
  if (!sp || sp.kind !== 'species') notFound();

  const prefs = getPreferences();

  const fr = sp.regions?.france;
  const wa = sp.regions?.west_africa;
  const region = prefs.region === 'afrique-ouest' ? wa : fr;
  const familyColor = getCategoryColor(sp.category);
  const familyLabel = getCategoryLabel(sp.category);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        crumbs={[
          { name: "L'étal", href: '/' },
          { name: sp.name, href: `/espece/${sp.slug}` },
        ]}
      />

      {/* Header card — Kultiva style, teinté famille */}
      <section
        className="rounded-3xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${familyColor}1f, ${familyColor}40)`,
          border: `2px solid ${familyColor}b3`,
          padding: '24px',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-6xl shrink-0 mx-auto md:mx-0"
            style={{ background: '#fff', border: `2px solid ${familyColor}80` }}
          >
            {sp.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sp.image_url} alt={sp.name} className="w-full h-full object-contain p-2" />
            ) : (
              <span aria-hidden>{sp.emoji ?? '🌱'}</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <span
              className="inline-block font-body font-bold text-xs uppercase tracking-wider px-2 py-1 rounded-full"
              style={{ background: '#fff', color: familyColor, border: `1.5px solid ${familyColor}` }}
            >
              {familyLabel}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mt-2">{sp.name}</h1>
            {sp.description && (
              <p className="font-body text-fg mt-3 leading-relaxed">{sp.description}</p>
            )}
          </div>
        </div>
        {sp.note && (
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${familyColor}40` }}>
            <p className="font-body text-sm text-fg-muted italic">💡 {sp.note}</p>
          </div>
        )}
      </section>

      {/* Actions rapides — Acheter (Amazon) + Planter (app) */}
      <div className="flex flex-wrap items-center justify-center gap-3 -mt-2">
        <AmazonAffiliateInline name={sp.name} kind="species" category={sp.category} />
        <AddToKultivaPlanButton
          campaign={`espece-${sp.slug}`}
          label="Planter dans l'app Kultiva"
        />
      </div>

      {/* Calendars */}
      {region?.sowing_months && region.sowing_months.length > 0 && (
        <SpeciesCalendarBars
          title={`Semis — ${prefs.region === 'afrique-ouest' ? "Afrique de l'Ouest" : 'France'}`}
          months={region.sowing_months}
          tone="sow"
          regionalNote={region.regional_note ?? null}
        />
      )}
      {region?.harvest_months && region.harvest_months.length > 0 && (
        <SpeciesCalendarBars
          title={`Récolte — ${prefs.region === 'afrique-ouest' ? "Afrique de l'Ouest" : 'France'}`}
          months={region.harvest_months}
          tone="harvest"
        />
      )}

      {/* Semis details */}
      <SpeciesKeyValueCard
        icon="🌱"
        title="Semis"
        rows={[
          { label: 'Technique', value: sp.sowing_technique },
          { label: 'Profondeur', value: sp.sowing_depth },
          { label: 'Température', value: sp.germination_temp },
          { label: 'Levée', value: sp.germination_days },
        ]}
      />

      {/* Culture details */}
      <SpeciesKeyValueCard
        icon="🌿"
        title="Culture"
        rows={[
          { label: 'Exposition', value: sp.exposure },
          { label: 'Espacement', value: sp.spacing },
          { label: 'Arrosage', value: sp.watering },
          { label: 'Sol', value: sp.soil },
        ]}
      />

      {/* Harvest time per season */}
      {sp.harvest_time_by_season && Object.keys(sp.harvest_time_by_season).length > 0 && (
        <section className="card-cream">
          <h2 className="font-display font-bold text-xl text-fg mb-3">
            <span aria-hidden className="mr-2">⏱</span>Temps avant récolte
          </h2>
          <dl className="space-y-2 font-body text-sm">
            {sp.harvest_time_by_season.spring && (
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <dt className="text-fg-muted">🌸 Printemps</dt>
                <dd className="text-fg">{sp.harvest_time_by_season.spring}</dd>
              </div>
            )}
            {sp.harvest_time_by_season.summer && (
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <dt className="text-fg-muted">☀️ Été</dt>
                <dd className="text-fg">{sp.harvest_time_by_season.summer}</dd>
              </div>
            )}
            {sp.harvest_time_by_season.autumn && (
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <dt className="text-fg-muted">🍂 Automne</dt>
                <dd className="text-fg">{sp.harvest_time_by_season.autumn}</dd>
              </div>
            )}
            {sp.harvest_time_by_season.winter && (
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <dt className="text-fg-muted">❄️ Hiver</dt>
                <dd className="text-fg">{sp.harvest_time_by_season.winter}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Yield */}
      {sp.yield_estimate && (
        <SpeciesKeyValueCard
          icon="📦"
          title="Rendement"
          rows={[{ label: 'Estimation', value: sp.yield_estimate }]}
        />
      )}

      <CompanionsCard name={sp.name} />

      {/* Achat Amazon — gros bouton avant le CTA app */}
      <AmazonAffiliateButton name={sp.name} kind="species" category={sp.category} />

      <CTAKultiva context={`espece-${sp.slug}`} />
    </div>
  );
}
