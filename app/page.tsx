import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { CTAKultiva } from '@/components/CTAKultiva';
import { getPreferences } from '@/lib/preferences-server';

export const revalidate = 21600; // 6h ISR

export const metadata: Metadata = {
  title: 'Comparateur de prix jardinage — graines, plants, outils',
  description:
    'Compare en un clic les prix des graines, plants et outils chez les marchands jardinage français. Mis à jour plusieurs fois par jour, prix au gramme, alertes de baisse.',
  alternates: { canonical: '/' },
};

async function getData() {
  const [{ data: cats }, { data: featured }] = await Promise.all([
    supabase.from('categories').select('*').is('parent_id', null).order('sort_order'),
    supabase
      .from('products_master')
      .select('id, slug, name, image_url, offers(price, merchant_id)')
      .not('slug', 'like', 'tmp-%')
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

  return { cats: cats ?? [], products };
}

export default async function HomePage() {
  const { cats, products } = await getData();
  const prefs = getPreferences();

  return (
    <div className="flex flex-col gap-16">
      <section className="relative pt-6 pb-4 overflow-hidden">
        <div className="blob" style={{ width: 360, height: 360, background: '#BCE5C1', top: -80, left: -120 }} />
        <div className="blob" style={{ width: 420, height: 420, background: '#FBD8E6', top: 40, right: -140 }} />
        <div className="blob" style={{ width: 260, height: 260, background: '#FFE7A0', bottom: -60, left: '40%', opacity: 0.35 }} />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="eyebrow-pill">🌱 Comparateur neutre de graines, plants et outils</span>
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
