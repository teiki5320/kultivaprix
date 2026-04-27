import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { SpeciesCard } from '@/components/SpeciesCard';
import { CTAKultiva } from '@/components/CTAKultiva';
import { buildCategoryIntro, buildCategoryMeta } from '@/lib/content-templates/category';
import { getPreferences } from '@/lib/preferences-server';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { itemListLd } from '@/lib/jsonld';

export const revalidate = 21600; // 6h

type Kind = 'species' | 'accessory';

// Mapping catégorie kultivaprix → filtre dans public.species
//   - graines / plants : toutes les espèces (kind='species')
//   - bulbes : species avec category='bulbs'
//   - outils, terreau-engrais, serres-abris, arrosage, protection :
//     accessoires filtrés par accessory_sub
const SPECIES_FILTER: Record<
  string,
  { kind: Kind; col?: 'category' | 'accessory_sub'; vals?: string[] }
> = {
  graines: { kind: 'species' },
  plants: { kind: 'species' },
  bulbes: { kind: 'species', col: 'category', vals: ['bulbs'] },
  outils: { kind: 'accessory', col: 'accessory_sub', vals: ['tools'] },
  'terreau-engrais': { kind: 'accessory', col: 'accessory_sub', vals: ['soil'] },
  'serres-abris': { kind: 'accessory', col: 'accessory_sub', vals: ['structures'] },
  arrosage: { kind: 'accessory', col: 'accessory_sub', vals: ['watering'] },
  protection: { kind: 'accessory', col: 'accessory_sub', vals: ['protection'] },
};

interface SpeciesRow {
  slug: string;
  name: string;
  emoji: string | null;
  image_url: string | null;
  kind: Kind;
}

async function getSpecies(slug: string): Promise<SpeciesRow[]> {
  const f = SPECIES_FILTER[slug];
  if (!f) return [];
  let q = supabase
    .schema('public')
    .from('species')
    .select('slug, name, emoji, image_url, kind')
    .eq('kind', f.kind)
    .order('name');
  if (f.col && f.vals) q = q.in(f.col, f.vals);
  const { data } = await q;
  return (data as SpeciesRow[] | null) ?? [];
}

async function getCategory(slug: string) {
  const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single();
  if (!cat) return null;

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
  const [data, species] = await Promise.all([
    getCategory(params.category),
    getSpecies(params.category),
  ]);
  if (!data) notFound();
  const { cat, rows, merchantCount } = data;
  const prefs = getPreferences();

  const intro = buildCategoryIntro({
    name: cat.name,
    slug: cat.slug,
    productCount: rows.length,
    merchantCount,
  });

  const speciesItems = species.map((s) => ({
    slug: s.slug,
    name: s.name,
    href: s.kind === 'species' ? `/espece/${s.slug}` : `/accessoire/${s.slug}`,
  }));
  const itemList = itemListLd(
    cat.name,
    speciesItems.length
      ? speciesItems.map((s) => ({ slug: s.slug, name: s.name }))
      : rows.map((r) => ({ slug: r.slug, name: r.name })),
    speciesItems.length ? '' : '/produit/',
  );

  const speciesHeading = species.length
    ? species[0].kind === 'species'
      ? 'Les espèces qu’on suit'
      : 'Les accessoires qu’on suit'
    : null;

  return (
    <div className="flex flex-col gap-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <Breadcrumbs
        crumbs={[
          { name: 'Accueil', href: '/' },
          { name: cat.name, href: `/${cat.slug}` },
        ]}
      />
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

      {species.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-2xl font-bold text-fg">{speciesHeading}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {species.map((s) => (
              <SpeciesCard
                key={s.slug}
                slug={s.slug}
                name={s.name}
                emoji={s.emoji}
                imageUrl={s.image_url}
                kind={s.kind}
                light={prefs.light}
              />
            ))}
          </div>
        </section>
      )}

      {rows.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-2xl font-bold text-fg">Offres marchands suivies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rows.map((r) => (
              <ProductCard key={r.slug} {...r} currency={prefs.currency} light={prefs.light} />
            ))}
          </div>
        </section>
      )}

      <CTAKultiva context={`cat-${cat.slug}`} />
    </div>
  );
}
