import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { CTAKultiva } from '@/components/CTAKultiva';
import { formatPrice } from '@/lib/utils';

export const revalidate = 21600;

async function getMerchant(slug: string) {
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, slug, name, base_url, logo_url, program')
    .eq('slug', slug)
    .maybeSingle();
  if (!merchant) return null;

  const { data: offers } = await supabase
    .from('offers')
    .select('product_id, price, in_stock, last_seen_at, products_master(slug, name, image_url)')
    .eq('merchant_id', (merchant as any).id)
    .limit(200);

  const products = new Map<string, any>();
  let inStock = 0;
  let prices: number[] = [];
  let mostRecent: string | null = null;
  for (const o of offers ?? []) {
    if (o.in_stock) inStock++;
    if (typeof o.price === 'number') prices.push(o.price);
    if (!mostRecent || (o.last_seen_at && o.last_seen_at > mostRecent)) mostRecent = o.last_seen_at;
    const pm = (o as any).products_master;
    if (pm && !products.has(pm.slug)) {
      products.set(pm.slug, {
        slug: pm.slug,
        name: pm.name,
        imageUrl: pm.image_url,
        minPrice: o.price,
        merchantCount: 1,
      });
    }
  }

  return {
    ...(merchant as any),
    productCount: products.size,
    inStockCount: inStock,
    avgPrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
    minPrice: prices.length ? Math.min(...prices) : null,
    products: Array.from(products.values()).slice(0, 24),
    mostRecent,
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const m = await getMerchant(params.slug);
  if (!m) return {};
  return {
    title: `${m.name} : prix et catalogue jardinage`,
    description: `Comparatif des prix chez ${m.name} : ${m.productCount} produits suivis, ${m.inStockCount} en stock. Prix mis à jour automatiquement.`,
  };
}

export default async function MerchantPage({ params }: { params: { slug: string } }) {
  const m = await getMerchant(params.slug);
  if (!m) notFound();

  return (
    <div className="flex flex-col gap-10">
      <header className="card-cream flex flex-col md:flex-row md:items-center gap-6">
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center bg-white shrink-0 mx-auto md:mx-0"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          {m.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.logo_url} alt={m.name} className="w-full h-full object-contain p-2" />
          ) : (
            <span className="text-4xl" aria-hidden>🏪</span>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <span className="kicker">🏪 Marchand suivi</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mt-2">{m.name}</h1>
          {m.base_url && (
            <a
              href={m.base_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-body text-sm font-semibold mt-1 inline-block"
              style={{ color: 'var(--terracotta-deep)' }}
            >
              {new URL(m.base_url).hostname} ↗
            </a>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Produits suivis', value: m.productCount },
          { label: 'En stock', value: m.inStockCount },
          { label: 'Prix moyen', value: m.avgPrice ? formatPrice(m.avgPrice) : '—' },
          { label: 'Prix mini', value: m.minPrice ? formatPrice(m.minPrice) : '—' },
        ].map((s) => (
          <div key={s.label} className="card-cream text-center">
            <div className="font-display text-3xl font-bold" style={{ color: 'var(--brand-dark)' }}>
              {s.value}
            </div>
            <div className="font-body text-sm text-fg-muted mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      <section>
        <span className="kicker">🌱 Catalogue suivi</span>
        <h2 className="font-display text-3xl font-bold mt-3 mb-4 text-fg">
          Quelques produits chez {m.name}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {m.products.map((p: any) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
        {m.products.length === 0 && (
          <div className="card-cream text-center text-fg-muted">
            Aucun produit suivi pour le moment chez {m.name}.
          </div>
        )}
      </section>

      <aside className="card-cream">
        <span className="kicker">ℹ️ À propos de ce comparatif</span>
        <p className="font-body text-fg mt-2 leading-relaxed">
          Kultivaprix est un comparateur indépendant. {m.name} ne paie pas pour apparaître ici :
          tous les marchands sont classés au prix, en stock d&apos;abord. Les liens vers la boutique
          sont des liens d&apos;affiliation.
        </p>
        <Link href="/" className="font-body text-sm font-bold mt-3 inline-block" style={{ color: 'var(--terracotta-deep)' }}>
          ← Retour au comparateur
        </Link>
      </aside>

      <CTAKultiva context={`marchand-${m.slug}`} />
    </div>
  );
}
