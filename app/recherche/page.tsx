import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';
import { getPreferences } from '@/lib/preferences-server';

export const revalidate = 3600;

interface Props {
  searchParams: { q?: string };
}

async function search(q: string) {
  if (!q) return [];
  const { data } = await supabase
    .from('products_master')
    .select('id, slug, name, image_url, offers(price, merchant_id)')
    .ilike('name', `%${q}%`)
    .not('slug', 'like', 'tmp-%')
    .limit(48);
  return (
    data?.map((p: any) => {
      const prices = (p.offers ?? []).map((o: any) => o.price).filter((n: number) => typeof n === 'number');
      const merchants = new Set((p.offers ?? []).map((o: any) => o.merchant_id));
      return {
        slug: p.slug,
        name: p.name,
        imageUrl: p.image_url,
        minPrice: prices.length ? Math.min(...prices) : null,
        merchantCount: merchants.size,
      };
    }) ?? []
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? '').trim();
  const results = await search(q);
  const prefs = getPreferences();
  return (
    <div className="flex flex-col gap-8">
      <header>
        <span className="kicker">🔎 Recherche</span>
        <h1 className="font-display text-4xl font-bold text-fg mt-3">
          Trouve le <em className="hero-em">meilleur prix</em>
        </h1>
      </header>
      <form method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Ex: tomate Marmande, sécateur, terreau…"
          className="flex-1 px-5 py-4 rounded-bubble bg-white font-body text-fg placeholder:text-fg-subtle focus:outline-none transition"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        />
        <button type="submit" className="btn-primary">Chercher</button>
      </form>
      {q && (
        <p className="font-body text-fg-muted">
          {results.length} résultat{results.length > 1 ? 's' : ''} pour <strong>«&nbsp;{q}&nbsp;»</strong>.
        </p>
      )}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map((r) => (
          <ProductCard key={r.slug} {...r} currency={prefs.currency} light={prefs.light} />
        ))}
      </section>
      {!q && (
        <div className="card-cream">
          <p className="font-body text-fg">Tape une variété, une marque ou un outil pour démarrer.</p>
          <p className="mt-2 font-body text-fg-muted">
            Tu peux aussi parcourir par <Link href="/graines">catégorie</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
