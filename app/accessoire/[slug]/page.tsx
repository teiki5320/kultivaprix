import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { CTAKultiva } from '@/components/CTAKultiva';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { AmazonAffiliateInline, AmazonAffiliateButton } from '@/components/AmazonAffiliate';
import { getCategoryColor } from '@/lib/etal-categories';

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
  const familyColor = getCategoryColor('accessories');

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        crumbs={[
          { name: "L'étal", href: '/' },
          { name: a.name, href: `/accessoire/${a.slug}` },
        ]}
      />

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
            className="w-28 h-28 rounded-2xl flex items-center justify-center text-6xl shrink-0 mx-auto md:mx-0 relative overflow-hidden"
            style={{ background: '#fff', border: `2px solid ${familyColor}80` }}
          >
            {a.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.image_url} alt={a.name} className="w-full h-full object-contain p-2" />
            ) : (
              <span aria-hidden>{a.emoji ?? '🛠'}</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <span
              className="inline-block font-body font-bold text-xs uppercase tracking-wider px-2 py-1 rounded-full"
              style={{ background: '#fff', color: familyColor, border: `1.5px solid ${familyColor}` }}
            >
              Accessoire
              {a.accessory_sub && SUB_LABELS[a.accessory_sub]
                ? ` · ${SUB_LABELS[a.accessory_sub]}`
                : ''}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mt-2">{a.name}</h1>
            {a.note && <p className="font-body text-fg mt-3 leading-relaxed">{a.note}</p>}
          </div>
        </div>
      </section>

      {/* Action rapide en haut */}
      <div className="flex justify-center -mt-2">
        <AmazonAffiliateInline name={a.name} kind="accessory" category={a.category} />
      </div>

      {/* Achat Amazon — gros bouton avant le CTA app */}
      <AmazonAffiliateButton name={a.name} kind="accessory" category={a.category} />

      <CTAKultiva context={`accessoire-${a.slug}`} />
    </div>
  );
}
