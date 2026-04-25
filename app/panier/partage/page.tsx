import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CTAKultiva } from '@/components/CTAKultiva';
import { formatPrice } from '@/lib/utils';
import { ImportButton } from './ImportButton';

export const revalidate = 0;

interface Props {
  searchParams: { items?: string };
}

async function fetchProducts(slugs: string[]) {
  if (slugs.length === 0) return [];
  const { data } = await supabase
    .from('products_master')
    .select('slug, name, image_url, offers(price, merchant_id)')
    .in('slug', slugs);
  return (data ?? []).map((p: any) => {
    const prices = (p.offers ?? []).map((o: any) => o.price).filter((n: number) => typeof n === 'number');
    return {
      slug: p.slug,
      name: p.name,
      image_url: p.image_url,
      minPrice: prices.length ? Math.min(...prices) : null,
    };
  });
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const slugs = (searchParams.items ?? '').split(',').filter(Boolean);
  return {
    title: `Panier partagé · ${slugs.length} produits`,
    description: 'Voici un panier partagé depuis Kultivaprix. Tu peux le consulter et l’importer en un clic.',
  };
}

export default async function ShareCartPage({ searchParams }: Props) {
  const slugs = (searchParams.items ?? '').split(',').filter(Boolean).slice(0, 30);
  const products = await fetchProducts(slugs);

  return (
    <div className="flex flex-col gap-8">
      <header className="text-center pt-4">
        <span className="kicker">📤 Panier partagé</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          {products.length} produit{products.length > 1 ? 's' : ''} <em className="hero-em">à comparer</em>
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          Quelqu&apos;un t&apos;a partagé sa sélection. Importe-la dans ton panier pour calculer
          le meilleur split entre marchands.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-3">
        {products.map((p) => (
          <Link
            key={p.slug}
            href={`/produit/${p.slug}`}
            className="card-cream flex items-center gap-3 no-underline transition hover:-translate-y-1 hover:shadow-leaf"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center shrink-0" style={{ background: 'var(--cream)' }}>
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="text-2xl" aria-hidden>🌱</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body font-bold text-sm text-fg truncate">{p.name}</div>
              <div className="font-display font-bold mt-1" style={{ color: 'var(--terracotta-deep)' }}>
                {p.minPrice != null ? `dès ${formatPrice(p.minPrice)}` : '—'}
              </div>
            </div>
          </Link>
        ))}
      </section>

      <ImportButton slugs={slugs} />

      <CTAKultiva context="panier-partage" />
    </div>
  );
}
