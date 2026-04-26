import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { CTAKultiva } from '@/components/CTAKultiva';
import { getPreferences } from '@/lib/preferences-server';

export const revalidate = 21600; // 6h ISR

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';
const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

export const metadata: Metadata = {
  title: 'Comparateur de prix jardinage — graines, plants, outils',
  description:
    'Compare en un clic les prix des graines, plants et outils chez les marchands jardinage français. Mis à jour plusieurs fois par jour, prix au gramme, alertes de baisse.',
  alternates: { canonical: '/' },
};

async function getData() {
  const [{ data: cats }, { data: featured }, { data: speciesSample }] = await Promise.all([
    supabase.from('categories').select('*').is('parent_id', null).order('sort_order'),
    supabase
      .from('products_master')
      .select('id, slug, name, image_url, offers(price, merchant_id)')
      .not('slug', 'like', 'tmp-%')
      .limit(12),
    publicClient
      .from('species')
      .select('slug, name, emoji, kind, image_url')
      .eq('kind', 'species')
      .order('name')
      .limit(12),
  ]);

  const products =
    featured?.map((p: any) => {
      const prices = (p.offers ?? []).map((o: any) => o.price).filter((n: number) => typeof n === 'number');
      const merchants = new Set((p.offers ?? []).map((o: any) => o.merchant_id));
      return {
        slug: p.slug,
        name: p.name,
        imageUrl: p.image_url,
        minPrice: prices.length ? Math.min(...prices) : null,
        merchantCount: merchants.size,
      };
    }) ?? [];

  return { cats: cats ?? [], products, species: speciesSample ?? [] };
}

export default async function HomePage() {
  const { cats, products, species } = await getData();
  const prefs = getPreferences();

  return (
    <div className="flex flex-col gap-16">
      <section className="relative pt-6 pb-4 overflow-hidden">
        <div className="blob" style={{ width: 360, height: 360, background: '#BCE5C1', top: -80, left: -120 }} />
        <div className="blob" style={{ width: 420, height: 420, background: '#FBD8E6', top: 40, right: -140 }} />
        <div className="blob" style={{ width: 260, height: 260, background: '#FFE7A0', bottom: -60, left: '40%', opacity: 0.35 }} />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="eyebrow-pill">🌱 Comparateur neutre · 100% automatique</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl leading-[1.02] mt-5 tracking-tight text-fg">
            Jardine malin, <em className="hero-em">paie juste</em>.
          </h1>
          <p className="mt-5 text-lg font-body text-fg-muted leading-relaxed max-w-2xl mx-auto">
            Graines, plants et matériel de jardinage chez les marchands français. Prix actualisés
            plusieurs fois par jour, historique en clair, zéro bla-bla.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/recherche" className="btn-primary">
              🔎 Commencer à chercher <span className="text-lg">→</span>
            </Link>
            <Link href="/guide/bien-choisir-ses-graines" className="btn-ghost">
              📖 Guide des graines
            </Link>
          </div>
        </div>
      </section>

      {species.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="kicker">🌱 Catalogue Kultiva</span>
              <h2 className="font-display text-3xl font-bold mt-3 text-fg">Espèces du potager</h2>
            </div>
            <Link
              href="/catalogue"
              className="hidden sm:inline font-body font-bold text-sm hover:underline"
              style={{ color: 'var(--terracotta-deep)' }}
            >
              Voir le catalogue complet →
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {species.map((s: any) => (
              <Link
                key={s.slug}
                href={`/espece/${s.slug}`}
                className="card-cream text-center no-underline transition hover:-translate-y-1 hover:shadow-leaf flex flex-col items-center gap-2 p-3"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: 'var(--cream)' }}
                >
                  {s.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image_url} alt={s.name} className="w-full h-full object-contain" />
                  ) : (
                    <span aria-hidden>{s.emoji ?? '🌱'}</span>
                  )}
                </div>
                <div className="font-display font-bold text-xs text-fg leading-tight">{s.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {cats.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="kicker">🌿 Catégories</span>
              <h2 className="font-display text-3xl font-bold mt-3 text-fg">Par où on commence ?</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cats.map((c: any, i: number) => (
              <Link
                key={c.id}
                href={`/${c.slug}`}
                className={`rounded-bubble p-6 text-center transition hover:-translate-y-1 hover:shadow-leaf no-underline ${
                  ['card-gradient-a', 'card-gradient-b', 'card-gradient-c', 'card-cream'][i % 4]
                }`}
              >
                <div className="text-5xl">{c.icon ?? '🌿'}</div>
                <div className="font-display font-bold text-lg mt-2 text-fg">{c.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="kicker kicker-terra">🍅 Sélection</span>
            <h2 className="font-display text-3xl font-bold mt-3 text-fg">Quelques produits suivis</h2>
          </div>
          <Link
            href="/recherche"
            className="hidden sm:inline font-body font-bold text-sm hover:underline"
            style={{ color: 'var(--terracotta-deep)' }}
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.slug} {...p} currency={prefs.currency} light={prefs.light} />
          ))}
        </div>
      </section>

      <CTAKultiva context="home" />
    </div>
  );
}
