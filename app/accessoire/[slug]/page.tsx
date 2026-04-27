import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CTAKultiva } from '@/components/CTAKultiva';

export const revalidate = 21600;

interface AccessoryRow {
  slug: string;
  kind: 'species' | 'accessory';
  name: string;
  emoji: string | null;
  category: string;
  accessory_sub: string | null;
  image_url: string | null;
  description: string | null;
  note: string | null;
}

const SUB_LABELS: Record<string, string> = {
  tools: 'Outil',
  pots: 'Pot ou contenant',
  soil: 'Terreau ou amendement',
  seeds: 'Sachet de graines',
  watering: 'Arrosage',
  protection: 'Protection',
  structures: 'Structure',
};

async function getAccessory(slug: string): Promise<AccessoryRow | null> {
  const { data } = await supabase
    .schema('public')
    .from('species')
    .select('slug, kind, name, emoji, category, accessory_sub, image_url, description, note')
    .eq('slug', slug)
    .eq('kind', 'accessory')
    .maybeSingle();
  return (data as AccessoryRow | null) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const acc = await getAccessory(params.slug);
  if (!acc) return {};
  const description =
    acc.description?.slice(0, 160) ??
    `Comparateur de prix pour ${acc.name} chez les marchands jardinage français.`;
  const canonical = `/accessoire/${acc.slug}`;
  return {
    title: acc.name,
    description,
    alternates: { canonical },
    openGraph: { title: acc.name, description, url: canonical },
  };
}

export default async function AccessoryPage({ params }: { params: { slug: string } }) {
  const acc = await getAccessory(params.slug);
  if (!acc) notFound();

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumbs
        crumbs={[
          { name: 'Accueil', href: '/' },
          { name: acc.name, href: `/accessoire/${acc.slug}` },
        ]}
      />

      <header className="text-center pt-4">
        <span className="kicker">🪴 Accessoire</span>
        <div className="text-7xl mt-4">{acc.emoji ?? '🪴'}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-2">{acc.name}</h1>
        {acc.accessory_sub && (
          <p className="mt-2 text-fg-muted">{SUB_LABELS[acc.accessory_sub] ?? acc.accessory_sub}</p>
        )}
        {acc.note && (
          <p className="mt-3 italic text-fg-muted max-w-2xl mx-auto">{acc.note}</p>
        )}
      </header>

      {acc.description && (
        <article className="prose max-w-none card-cream">
          {acc.description.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      )}

      <section className="card-cream text-center">
        <h2 className="font-display text-xl font-bold text-fg mb-3">Comparer les prix marchands</h2>
        <p className="text-fg-muted">
          On suit les prix chez les marchands jardinage français. Le tableau s'affichera ici dès que
          les premières offres seront référencées.
        </p>
      </section>

      <CTAKultiva context={`accessoire-${acc.slug}`} />
    </div>
  );
}
