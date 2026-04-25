import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { CTAKultiva } from '@/components/CTAKultiva';
import { buildCategoryIntro, buildCategoryMeta } from '@/lib/content-templates/category';
import { getPreferences } from '@/lib/preferences-server';

export const revalidate = 21600; // 6h

async function getCategory(slug: string) {
  const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single();
  if (!cat) return null;

  // Récupère produits de la catégorie + sous-catégories
  const { data: children } = await supabase.from('categories').select('id').eq('parent_id', cat.id);
  const ids = [cat.id, ...(children?.map((c) => c.id) ?? [])];

  const { data: products } = await supabase
    .from('products_master')
    .select('id, slug, name, image_url, offers(price, merchant_id)')
    .in('category_id', ids)
    .not('slug', 'like', 'tmp-%')
    .limit(60);

  const rows =
    products?.map((p: any) => {
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

  const merchantSet = new Set<string>();
  products?.forEach((p: any) => (p.offers ?? []).forEach((o: any) => merchantSet.add(o.merchant_id)));

  return { cat, rows, merchantCount: merchantSet.size };
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const data = await getCategory(params.category);
  if (!data) return {};
  const description = buildCategoryMeta({
    name: data.cat.name,
    slug: data.cat.slug,
    productCount: data.rows.length,
    merchantCount: data.merchantCount,
  });
  const canonical = `/${data.cat.slug}`;
  return {
    title: data.cat.name,
    description,
    alternates: { canonical },
    openGraph: { title: data.cat.name, description, url: canonical },
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const data = await getCategory(params.category);
  if (!data) notFound();
  const { cat, rows, merchantCount } = data;
  const prefs = getPreferences();

  const intro = buildCategoryIntro({
    name: cat.name,
    slug: cat.slug,
    productCount: rows.length,
    merchantCount,
  });

  return (
    <div className="flex flex-col gap-10">
      <header className="text-center pt-4">
        <span className="kicker">🌿 Catégorie</span>
        <div className="text-6xl mt-4">{cat.icon ?? '🌿'}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-2">
          {cat.name}
        </h1>
      </header>

      <article className="prose max-w-none card-cream">
        {intro.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rows.map((r) => (
          <ProductCard key={r.slug} {...r} currency={prefs.currency} light={prefs.light} />
        ))}
      </section>

      <CTAKultiva context={`cat-${cat.slug}`} />
    </div>
  );
}
