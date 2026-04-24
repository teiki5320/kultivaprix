import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { CTAKultiva } from '@/components/CTAKultiva';

export const revalidate = 21600; // 6h ISR

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

  return (
    <div className="flex flex-col gap-10">
      <section className="text-center pt-6">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-kawaii-green-600">
          Jardine malin, paie juste. 🌷
        </h1>
        <p className="mt-3 text-lg text-kawaii-ink/80 max-w-2xl mx-auto">
          Comparateur 100% automatique de <strong>graines</strong>, <strong>plants</strong>
          {' '}et <strong>matériel de jardinage</strong> chez les marchands français.
          Prix actualisés plusieurs fois par jour.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          <Link href="/recherche" className="btn-kawaii">🔎 Commencer à chercher</Link>
          <Link href="/guide/bien-choisir-ses-graines" className="btn-kawaii-green">📖 Guide graines</Link>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-extrabold mb-4">Catégories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cats.map((c: any) => (
            <Link key={c.id} href={`/${c.slug}`} className="card-kawaii text-center hover:shadow-leaf">
              <div className="text-4xl">{c.icon ?? '🌿'}</div>
              <div className="font-display font-bold mt-1">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-extrabold mb-4">Quelques produits suivis</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      </section>

      <CTAKultiva context="home" />
    </div>
  );
}
