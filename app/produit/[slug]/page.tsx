import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PriceTable } from '@/components/PriceTable';
import { PriceHistoryChart } from '@/components/PriceHistoryChart';
import { PriceBadges } from '@/components/PriceBadges';
import { RankingExplainer } from '@/components/RankingExplainer';
import { CTAKultiva } from '@/components/CTAKultiva';
import { buildProductDescription, buildProductMeta } from '@/lib/content-templates/product';
import { SITE_URL, formatPrice } from '@/lib/utils';
import { computePriceStats } from '@/lib/price-stats';
import { getPreferences } from '@/lib/preferences-server';
import { convertAndFormat } from '@/lib/format-money';
import { SimilarProducts } from '@/components/SimilarProducts';
import { PriceAlertForm } from '@/components/PriceAlertForm';
import { AddToCartButton } from '@/components/AddToCartButton';
import { CulturalDataCard } from '@/components/CulturalDataCard';
import { EcoScoreBadge } from '@/components/EcoScoreBadge';
import { ReviewsSection } from '@/components/ReviewsSection';
import { detectTags } from '@/lib/parse-tags';
import { computeEcoScore } from '@/lib/eco-score';
import { AddToKultivaPlanButton } from '@/components/AddToKultivaPlanButton';
import { CompanionsCard } from '@/components/CompanionsCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { RelatedLinks } from '@/components/RelatedLinks';

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

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, body, display_name, created_at')
    .eq('product_id', product.id)
    .eq('status', 'approved');

  return {
    product,
    offerRows,
    history: history ?? [],
    reviews: (reviews ?? []) as { rating: number; body: string; display_name: string; created_at: string }[],
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProduct(params.slug);
  if (!data) return {};
  const prices = data.offerRows.map((o) => o.price).filter((n): n is number => typeof n === 'number');
  const minPrice = prices.length ? Math.min(...prices) : null;
  const description = buildProductMeta({
    name: data.product.name,
    slug: data.product.slug,
    minPrice,
    maxPrice: prices.length ? Math.max(...prices) : null,
    offerCount: data.offerRows.length,
  });
  const canonical = `/produit/${data.product.slug}`;
  return {
    title: data.product.name,
    description,
    alternates: { canonical },
    openGraph: {
      title: data.product.name,
      description,
      url: canonical,
      type: 'website',
      images: data.product.image_url ? [{ url: data.product.image_url, alt: data.product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const data = await getProduct(params.slug);
  if (!data) notFound();
  const { product, offerRows, history, reviews } = data;

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

  // AggregateRating from approved reviews (only when at least 1 exists).
  const aggregateRating = reviews.length
    ? {
        '@type': 'AggregateRating' as const,
        ratingValue: (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1),
        reviewCount: reviews.length,
      }
    : undefined;

  // JSON-LD Product + AggregateOffer (+ AggregateRating + Review when available)
  const jsonLd: Record<string, unknown> = {
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
    aggregateRating,
    review: reviews.slice(0, 3).map((r) => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
      author: { '@type': 'Person', name: r.display_name },
      reviewBody: r.body.slice(0, 300),
      datePublished: r.created_at,
    })),
  };
  if (!aggregateRating) delete jsonLd.aggregateRating;
  if (reviews.length === 0) delete jsonLd.review;

  // FAQPage — generic Q&A surfaces well in Google as a rich result
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Quel est le prix le plus bas pour ${product.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: minPrice
            ? `Le prix le plus bas constaté est ${formatPrice(minPrice)}, parmi ${offerRows.length} marchand(s) suivi(s).`
            : `Aucun prix n'est disponible pour le moment.`,
        },
      },
      {
        '@type': 'Question',
        name: `Comment savoir si c'est le bon moment pour acheter ${product.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            "Notre courbe d'historique des prix sur 90 jours t'indique si le prix actuel est bas, moyen ou haut par rapport au mois dernier. Plus c'est bas, plus c'est le bon moment.",
        },
      },
      {
        '@type': 'Question',
        name: `Les liens marchands sont-ils sponsorisés ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            "Non. Les marchands sont triés du moins cher au plus cher, et personne ne paie pour apparaître plus haut. Les liens sont des liens d'affiliation : ils financent le site sans changer le prix.",
        },
      },
    ],
  };

  const points = history.map((h: any) => ({
    date: new Date(h.recorded_at).toLocaleDateString('fr-FR', { month: 'short', day: '2-digit' }),
    price: Number(h.price),
  }));

  const priceStats = computePriceStats(
    minPrice,
    history.map((h: any) => ({ price: Number(h.price), recorded_at: h.recorded_at })),
  );
  const prefs = getPreferences();
  const tags = detectTags(product.name, product.brand, product.description);
  const ecoScore = computeEcoScore(tags);

  const crumbs = [
    { name: 'Accueil', href: '/' },
    ...(product.categories
      ? [{ name: product.categories.name, href: `/${product.categories.slug}` }]
      : []),
    { name: product.name, href: `/produit/${product.slug}` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <Breadcrumbs crumbs={crumbs} />

      <header className="grid md:grid-cols-2 gap-8 items-start">
        <div
          className="card-cream aspect-square relative overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--cream-surface)' }}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain rounded-2xl p-4"
              priority
            />
          ) : (
            <span className="text-7xl" aria-hidden>🌱</span>
          )}
        </div>
        <div className="flex flex-col gap-4 pt-2">
          <span className="kicker self-start">🌱 Produit suivi</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-fg leading-tight">
            {product.name}
          </h1>
          {product.brand && (
            <span
              className="pill self-start"
              style={{ background: 'color-mix(in oklab, var(--terracotta-deep) 14%, white)', color: 'var(--terracotta-deep)' }}
            >
              {product.brand}
            </span>
          )}
          {minPrice && (
            <p className="font-body text-xl text-fg-muted">
              À partir de{' '}
              <strong className="font-display text-3xl" style={{ color: 'var(--terracotta-deep)' }}>
                {convertAndFormat(minPrice, prefs.currency)}
              </strong>{' '}
              chez <strong className="text-fg">{offerRows.length}</strong> marchand(s).
            </p>
          )}
          <PriceBadges stats={priceStats} currency={prefs.currency} />
          <EcoScoreBadge score={ecoScore} />
          <div className="mt-2 flex flex-wrap gap-2">
            <AddToCartButton slug={product.slug} />
            <AddToKultivaPlanButton productSlug={product.slug} campaign={`product-${product.slug}`} />
          </div>
        </div>
      </header>

      <section>
        <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
          <div>
            <span className="kicker">💰 Offres</span>
            <h2 className="font-display text-3xl font-bold mt-3 text-fg">Comparer les prix</h2>
          </div>
          <RankingExplainer />
        </div>
        <PriceTable offers={offerRows} currency={prefs.currency} />
      </section>

      <section>
        <span className="kicker kicker-terra">📈 Tendance</span>
        <h2 className="font-display text-3xl font-bold mt-3 mb-4 text-fg">Historique des prix</h2>
        <PriceHistoryChart points={points} />
      </section>

      <section>
        <span className="kicker">📝 Repères</span>
        <h2 className="font-display text-3xl font-bold mt-3 mb-4 text-fg">À savoir</h2>
        <article className="card-cream prose max-w-none">
          {body.split('\n\n').map((p, i) =>
            p.startsWith('##') ? (
              <h3 key={i} className="font-display text-xl font-bold" style={{ color: 'var(--brand-dark)' }}>
                {p.replace(/^##\s*/, '')}
              </h3>
            ) : (
              <p key={i}>{p}</p>
            ),
          )}
        </article>
      </section>

      <CulturalDataCard name={product.name} attributes={product.attributes ?? null} />

      <CompanionsCard name={product.name} />

      <ReviewsSection productId={product.id} productSlug={product.slug} productName={product.name} />

      <PriceAlertForm
        productSlug={product.slug}
        productName={product.name}
        currentMin={minPrice}
      />

      <SimilarProducts slug={product.slug} currency={prefs.currency} light={prefs.light} />

      <RelatedLinks
        categorySlug={product.categories?.slug ?? null}
        categoryName={product.categories?.name ?? null}
      />

      <CTAKultiva context={`product-${product.slug}`} />
    </div>
  );
}
