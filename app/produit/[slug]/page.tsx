import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PriceTable } from '@/components/PriceTable';
import { PriceHistoryChart } from '@/components/PriceHistoryChart';
import { CTAKultiva } from '@/components/CTAKultiva';
import { buildProductDescription, buildProductMeta } from '@/lib/content-templates/product';
import { SITE_URL, formatPrice } from '@/lib/utils';

export const revalidate = 21600; // 6h

async function getProduct(slug: string) {
  const { data: product } = await supabase
    .from('products_master')
    .select('*, categories(slug, name)')
    .eq('slug', slug)
    .single();
  if (!product) return null;

  const { data: offers } = await supabase
    .from('offers')
    .select('id, title, price, currency, shipping_cost, in_stock, last_seen_at, merchants(slug, name)')
    .eq('product_id', product.id);

  const offerRows =
    offers?.map((o: any) => ({
      offer_id: o.id,
      merchant_slug: o.merchants?.slug ?? 'unknown',
      merchant_name: o.merchants?.name ?? 'Marchand',
      title: o.title,
      price: o.price,
      currency: o.currency,
      shipping_cost: o.shipping_cost,
      in_stock: o.in_stock,
      last_seen_at: o.last_seen_at,
    })) ?? [];

  const { data: history } = await supabase
    .from('price_history')
    .select('price, recorded_at')
    .eq('product_id', product.id)
    .order('recorded_at', { ascending: true })
    .limit(90);

  return { product, offerRows, history: history ?? [] };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProduct(params.slug);
  if (!data) return {};
  const prices = data.offerRows.map((o) => o.price).filter((n): n is number => typeof n === 'number');
  return {
    title: data.product.name,
    description: buildProductMeta({
      name: data.product.name,
      slug: data.product.slug,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      offerCount: data.offerRows.length,
    }),
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const data = await getProduct(params.slug);
  if (!data) notFound();
  const { product, offerRows, history } = data;

  const prices = offerRows.map((o) => o.price).filter((n): n is number => typeof n === 'number');
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

  const body = buildProductDescription({
    name: product.name,
    slug: product.slug,
    categoryName: product.categories?.name ?? null,
    minPrice,
    maxPrice,
    avgPrice,
    offerCount: offerRows.length,
  });

  // JSON-LD Product + AggregateOffer
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: body.replace(/[#*>]/g, '').slice(0, 300),
    image: product.image_url ?? undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    gtin13: product.gtin ?? undefined,
    offers: minPrice
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'EUR',
          lowPrice: minPrice,
          highPrice: maxPrice,
          offerCount: offerRows.length,
          url: `${SITE_URL}/produit/${product.slug}`,
        }
      : undefined,
  };

  const points = history.map((h: any) => ({
    date: new Date(h.recorded_at).toLocaleDateString('fr-FR', { month: 'short', day: '2-digit' }),
    price: Number(h.price),
  }));

  return (
    <div className="flex flex-col gap-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="grid md:grid-cols-2 gap-6 items-start">
        <div className="card-kawaii aspect-square flex items-center justify-center p-2">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain rounded-xl" />
          ) : (
            <span className="text-7xl">🌱</span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-kawaii-green-600">
            {product.name}
          </h1>
          {product.brand && (
            <span className="pill bg-kawaii-pink-100 text-kawaii-pink-600 self-start">
              {product.brand}
            </span>
          )}
          {minPrice && (
            <p className="text-xl">
              À partir de <strong className="text-kawaii-pink-600">{formatPrice(minPrice)}</strong>
              {' '}chez <strong>{offerRows.length}</strong> marchand(s).
            </p>
          )}
        </div>
      </header>

      <section>
        <h2 className="font-display text-2xl font-extrabold mb-3">💰 Comparer les prix</h2>
        <PriceTable offers={offerRows} />
      </section>

      <section>
        <h2 className="font-display text-2xl font-extrabold mb-3">📈 Historique des prix</h2>
        <PriceHistoryChart points={points} />
      </section>

      <section>
        <h2 className="font-display text-2xl font-extrabold mb-3">📝 À savoir</h2>
        <article className="card-kawaii prose max-w-none">
          {body.split('\n\n').map((p, i) =>
            p.startsWith('##') ? (
              <h3 key={i} className="font-display text-lg font-extrabold text-kawaii-green-600">
                {p.replace(/^##\s*/, '')}
              </h3>
            ) : (
              <p key={i}>{p}</p>
            ),
          )}
        </article>
      </section>

      <CTAKultiva context={`product-${product.slug}`} />
    </div>
  );
}
