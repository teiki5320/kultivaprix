import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { CTAKultiva } from '@/components/CTAKultiva';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Catalogue · espèces et accessoires',
  description:
    "Tout le catalogue Kultiva : espèces végétales (potager, aromates, fruits) et accessoires (outils, arrosage, protection). Le catalogue de l'app, en grand sur le web.",
  alternates: { canonical: '/catalogue' },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

interface CatalogRow {
  slug: string;
  kind: 'species' | 'accessory';
  name: string;
  emoji: string | null;
  category: string;
  accessory_sub: string | null;
  image_url: string | null;
}

const CATEGORY_ORDER: { key: string; label: string; emoji: string }[] = [
  { key: 'fruits', label: 'Fruits du potager', emoji: '🍅' },
  { key: 'leaves', label: 'Légumes-feuilles', emoji: '🥬' },
  { key: 'roots', label: 'Racines', emoji: '🥕' },
  { key: 'tubers', label: 'Tubercules', emoji: '🥔' },
  { key: 'bulbs', label: 'Bulbes', emoji: '🧅' },
  { key: 'seeds', label: 'Légumineuses & céréales', emoji: '🫘' },
  { key: 'aromatics', label: 'Aromates', emoji: '🌿' },
  { key: 'flowers', label: 'Fleurs comestibles', emoji: '🌺' },
  { key: 'stems', label: 'Tiges', emoji: '🥬' },
  { key: 'accessories', label: 'Accessoires & outillage', emoji: '🛠' },
];

export default async function CataloguePage() {
  const { data } = await publicClient
    .from('species')
    .select('slug, kind, name, emoji, category, accessory_sub, image_url')
    .order('name');
  const rows = (data ?? []) as CatalogRow[];

  const byCategory = new Map<string, CatalogRow[]>();
  for (const r of rows) {
    const arr = byCategory.get(r.category) ?? [];
    arr.push(r);
    byCategory.set(r.category, arr);
  }

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        crumbs={[
          { name: 'Accueil', href: '/' },
          { name: 'Catalogue', href: '/catalogue' },
        ]}
      />

      <header className="text-center">
        <span className="kicker">📚 Catalogue</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          Tout le potager <em className="hero-em">Kultiva</em>
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          Le catalogue complet des espèces végétales et accessoires, synchronisé
          avec l&apos;app Kultiva. Clique sur une fiche pour les conseils de
          culture, les périodes de semis et de récolte.
        </p>
      </header>

      {rows.length === 0 && (
        <div className="card-cream text-center">
          <div className="text-4xl">🌧</div>
          <p className="font-body font-bold text-fg mt-3">
            Le catalogue se synchronise depuis Kultiva.
          </p>
          <p className="font-body text-sm text-fg-muted mt-2">
            La table sera remplie dès la première sync (migration + seed). On y
            attend 98 entrées.
          </p>
        </div>
      )}

      {CATEGORY_ORDER.map(({ key, label, emoji }) => {
        const list = byCategory.get(key) ?? [];
        if (list.length === 0) return null;
        return (
          <section key={key}>
            <h2 className="font-display font-bold text-2xl text-fg mb-4">
              <span aria-hidden className="mr-2">{emoji}</span>
              {label}
              <span className="font-body font-normal text-fg-muted text-base ml-2">
                ({list.length})
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {list.map((r) => (
                <Link
                  key={r.slug}
                  href={`/${r.kind === 'species' ? 'espece' : 'accessoire'}/${r.slug}`}
                  className="card-cream text-center no-underline transition hover:-translate-y-1 hover:shadow-leaf flex flex-col items-center gap-2 p-4"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                    style={{ background: 'var(--cream)' }}
                  >
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image_url} alt={r.name} className="w-full h-full object-contain" />
                    ) : (
                      <span aria-hidden>{r.emoji ?? '🌱'}</span>
                    )}
                  </div>
                  <div className="font-display font-bold text-sm text-fg leading-tight">
                    {r.name}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <CTAKultiva context="catalogue" />
    </div>
  );
}
