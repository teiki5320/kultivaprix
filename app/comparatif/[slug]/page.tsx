import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CTAKultiva } from '@/components/CTAKultiva';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { formatPrice } from '@/lib/utils';
import { parseQuantity, unitPrice } from '@/lib/parse-quantity';
import { detectTags } from '@/lib/parse-tags';

export const revalidate = 86400;

/** Slug format: "<a>-vs-<b>" — lets us use a single dynamic route. */
function splitSlug(slug: string): [string, string] | null {
  const idx = slug.indexOf('-vs-');
  if (idx < 0) return null;
  const a = slug.slice(0, idx);
  const b = slug.slice(idx + 4);
  if (!a || !b) return null;
  return [a, b];
}

async function getProduct(slug: string) {
  const { data: product } = await supabase
    .from('products_master')
    .select('id, slug, name, brand, image_url, description, attributes, categories(name)')
    .eq('slug', slug)
    .maybeSingle();
  if (!product) return null;
  const { data: offers } = await supabase
    .from('offers')
    .select('price, in_stock, title, merchant_id, merchants(name)')
    .eq('product_id', (product as any).id);
  const prices = (offers ?? []).map((o: any) => o.price).filter((n: number) => typeof n === 'number');
  const minPrice = prices.length ? Math.min(...prices) : null;
  const merchantNames = Array.from(new Set((offers ?? []).map((o: any) => o.merchants?.name).filter(Boolean)));
  const sample = offers && offers.length ? offers[0].title : (product as any).name;
  return {
    ...(product as any),
    minPrice,
    offerCount: offers?.length ?? 0,
    merchantNames,
    sampleTitle: sample,
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const pair = splitSlug(params.slug);
  if (!pair) return {};
  const [a, b] = await Promise.all([getProduct(pair[0]), getProduct(pair[1])]);
  if (!a || !b) return {};
  // Always canonicalise to the alphabetical ordering so /a-vs-b and /b-vs-a
  // don't both rank — only the lexicographically-first variant is canonical.
  const [first, second] = pair[0] < pair[1] ? [pair[0], pair[1]] : [pair[1], pair[0]];
  const canonical = `/comparatif/${first}-vs-${second}`;
  const title = `${a.name} vs ${b.name} : comparatif`;
  const description = `Comparatif détaillé ${a.name} vs ${b.name} : prix, marchands, caractéristiques. Mis à jour automatiquement.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

interface Row {
  label: string;
  a: React.ReactNode;
  b: React.ReactNode;
}

export default async function ComparatifPage({ params }: { params: { slug: string } }) {
  const pair = splitSlug(params.slug);
  if (!pair) notFound();
  const [a, b] = await Promise.all([getProduct(pair[0]), getProduct(pair[1])]);
  if (!a || !b) notFound();

  const aQty = parseQuantity(a.sampleTitle, a.name);
  const bQty = parseQuantity(b.sampleTitle, b.name);
  const aUnit = unitPrice(a.minPrice, aQty);
  const bUnit = unitPrice(b.minPrice, bQty);
  const aTags = detectTags(a.sampleTitle, a.name, a.brand);
  const bTags = detectTags(b.sampleTitle, b.name, b.brand);

  const tagsToString = (t: ReturnType<typeof detectTags>) => {
    const labels: string[] = [];
    if (t.bio) labels.push('Bio');
    if (t.f1) labels.push('Hybride F1');
    if (t.reproductible) labels.push('Reproductible');
    if (t.origineFR) labels.push('Origine France');
    if (t.ancienne) labels.push('Ancienne variété');
    return labels.length ? labels.join(' · ') : '—';
  };

  const rows: Row[] = [
    { label: 'Marque', a: a.brand ?? '—', b: b.brand ?? '—' },
    { label: 'Catégorie', a: a.categories?.name ?? '—', b: b.categories?.name ?? '—' },
    {
      label: 'Prix mini',
      a: <span className="font-display font-bold text-lg" style={{ color: 'var(--terracotta-deep)' }}>{a.minPrice ? formatPrice(a.minPrice) : '—'}</span>,
      b: <span className="font-display font-bold text-lg" style={{ color: 'var(--terracotta-deep)' }}>{b.minPrice ? formatPrice(b.minPrice) : '—'}</span>,
    },
    {
      label: 'Prix au calibre',
      a: aUnit ? `${aUnit.value.toFixed(aUnit.value < 1 ? 3 : 2).replace('.', ',')} ${aUnit.label}` : '—',
      b: bUnit ? `${bUnit.value.toFixed(bUnit.value < 1 ? 3 : 2).replace('.', ',')} ${bUnit.label}` : '—',
    },
    { label: 'Marchands suivis', a: a.offerCount, b: b.offerCount },
    { label: 'Caractéristiques', a: tagsToString(aTags), b: tagsToString(bTags) },
    { label: 'Disponibilité', a: a.merchantNames.join(', ') || '—', b: b.merchantNames.join(', ') || '—' },
  ];

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumbs
        crumbs={[
          { name: 'Accueil', href: '/' },
          { name: `${a.name} vs ${b.name}`, href: `/comparatif/${pair[0]}-vs-${pair[1]}` },
        ]}
      />
      <header className="text-center pt-4">
        <span className="kicker">⚖️ Comparatif</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3 leading-tight">
          {a.name} <span className="text-fg-muted text-2xl align-middle">vs</span> {b.name}
        </h1>
      </header>

      <section className="grid grid-cols-2 gap-4">
        {[a, b].map((p, i) => (
          <Link
            key={i}
            href={`/produit/${p.slug}`}
            className="card-cream flex flex-col gap-3 no-underline transition hover:-translate-y-1 hover:shadow-leaf"
          >
            <div className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center relative" style={{ background: 'var(--cream)' }}>
              {p.image_url ? (
                <Image src={p.image_url} alt={p.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-contain p-4" />
              ) : (
                <span className="text-6xl" aria-hidden>🌱</span>
              )}
            </div>
            <div className="font-display font-bold text-fg text-lg leading-snug line-clamp-2">{p.name}</div>
          </Link>
        ))}
      </section>

      <section
        className="rounded-bubble overflow-hidden bg-white"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <table className="w-full text-sm font-body">
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} style={i % 2 === 0 ? { background: 'white' } : { background: 'var(--cream-surface)' }}>
                <th scope="row" className="text-left px-5 py-4 font-display font-bold text-fg w-40">
                  {row.label}
                </th>
                <td className="px-5 py-4 text-fg">{row.a}</td>
                <td className="px-5 py-4 text-fg">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <CTAKultiva context={`comparatif-${a.slug}-vs-${b.slug}`} />
    </div>
  );
}
