import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { CTAKultiva } from '@/components/CTAKultiva';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const revalidate = 21600;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

const SUB_LABELS: Record<string, string> = {
  tools: 'Outils',
  pots: 'Pots & contenants',
  soil: 'Terre & amendements',
  seeds: 'Graines & semences',
  watering: 'Arrosage',
  protection: 'Protection',
  structures: 'Structures',
};

interface Accessory {
  slug: string;
  kind: string;
  name: string;
  emoji: string | null;
  category: string;
  accessory_sub: string | null;
  image_url: string | null;
  note: string | null;
}

async function getAccessory(slug: string): Promise<Accessory | null> {
  const { data } = await publicClient
    .from('species')
    .select('slug, kind, name, emoji, category, accessory_sub, image_url, note')
    .eq('slug', slug)
    .maybeSingle();
  return (data as Accessory) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = await getAccessory(params.slug);
  if (!a || a.kind !== 'accessory') return {};
  const description = a.note ?? `${a.name} — fiche accessoire jardinage Kultiva.`;
  const canonical = `/accessoire/${a.slug}`;
  return {
    title: a.name,
    description,
    alternates: { canonical },
    openGraph: { title: a.name, description, url: canonical },
  };
}

export default async function AccessoryPage({ params }: { params: { slug: string } }) {
  const a = await getAccessory(params.slug);
  if (!a || a.kind !== 'accessory') notFound();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        crumbs={[
          { name: 'Accueil', href: '/' },
          { name: 'Accessoires', href: '/catalogue?kind=accessory' },
          { name: a.name, href: `/accessoire/${a.slug}` },
        ]}
      />

      <section className="card-cream">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shrink-0 mx-auto md:mx-0 relative overflow-hidden"
            style={{ background: 'var(--cream)' }}
          >
            {a.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.image_url} alt={a.name} className="w-full h-full object-contain p-2" />
            ) : (
              <span aria-hidden>{a.emoji ?? '🛠'}</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-fg">{a.name}</h1>
            {a.accessory_sub && (
              <div className="font-body text-fg-muted mt-1">
                {SUB_LABELS[a.accessory_sub] ?? a.accessory_sub}
              </div>
            )}
            {a.note && <p className="font-body text-fg mt-3 leading-relaxed">{a.note}</p>}
          </div>
        </div>
      </section>

      <CTAKultiva context={`accessoire-${a.slug}`} />
    </div>
  );
}
