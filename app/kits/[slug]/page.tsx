import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CTAKultiva } from '@/components/CTAKultiva';
import { KITS, findKit } from '@/lib/kits';
import { searchProducts } from '@/lib/search';
import { ProductCard } from '@/components/ProductCard';
import { getPreferences } from '@/lib/preferences-server';
import { ImportKitButton } from './ImportKitButton';

export const revalidate = 21600;

export async function generateStaticParams() {
  return KITS.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const k = findKit(params.slug);
  if (!k) return {};
  return {
    title: `${k.name} · Kit potager`,
    description: k.pitch,
  };
}

export default async function KitPage({ params }: { params: { slug: string } }) {
  const k = findKit(params.slug);
  if (!k) notFound();
  const prefs = getPreferences();

  // Resolve each query to its top product (best price match)
  const buckets = await Promise.all(k.queries.map((q) => searchProducts(q, 1)));
  const products = buckets.flat();
  const slugs = products.map((p) => p.slug);

  return (
    <div className="flex flex-col gap-10">
      <header className="text-center pt-4">
        <span className="kicker">🧺 Kit</span>
        <div className="text-6xl mt-2">{k.emoji}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-2">{k.name}</h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-3">{k.pitch}</p>
        <p className="font-body text-fg-subtle text-sm mt-2">{k.audience}</p>
      </header>

      {slugs.length > 0 && (
        <div className="text-center">
          <ImportKitButton slugs={slugs} />
        </div>
      )}

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard
            key={p.slug}
            slug={p.slug}
            name={p.name}
            imageUrl={p.image_url}
            minPrice={p.min_price}
            merchantCount={p.offer_count}
            currency={prefs.currency}
            light={prefs.light}
          />
        ))}
      </section>

      {products.length === 0 && (
        <div className="card-cream text-center text-fg-muted">
          Pas encore de produits matchés pour ce kit.{' '}
          <Link href="/recherche" style={{ color: 'var(--terracotta-deep)' }}>
            Cherche directement →
          </Link>
        </div>
      )}

      <CTAKultiva context={`kit-${k.slug}`} />
    </div>
  );
}
