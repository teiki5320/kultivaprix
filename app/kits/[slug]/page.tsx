import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CTAKultiva } from '@/components/CTAKultiva';
import { KITS, findKit } from '@/lib/kits';
import { toSlug } from '@/lib/utils';

export const revalidate = 21600;

export async function generateStaticParams() {
  return KITS.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const k = findKit(params.slug);
  if (!k) return {};
  const title = `${k.name} · Kit potager`;
  const canonical = `/kits/${k.slug}`;
  return {
    title,
    description: k.pitch,
    alternates: { canonical },
    openGraph: { title, description: k.pitch, url: canonical },
  };
}

export default async function KitPage({ params }: { params: { slug: string } }) {
  const k = findKit(params.slug);
  if (!k) notFound();

  return (
    <div className="flex flex-col gap-10">
      <header className="text-center pt-4">
        <span className="kicker">🧺 Kit</span>
        <div className="text-6xl mt-2">{k.emoji}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-2">{k.name}</h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-3">{k.pitch}</p>
        <p className="font-body text-fg-subtle text-sm mt-2">{k.audience}</p>
      </header>

      <section>
        <span className="kicker">🌱 Le kit en {k.queries.length} fiches</span>
        <h2 className="font-display text-2xl font-bold text-fg mt-3 mb-4">Ce qu&apos;on a sélectionné</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {k.queries.map((q) => (
            <Link
              key={q}
              href={`/espece/${toSlug(q)}`}
              className="card-cream text-center no-underline transition hover:-translate-y-1 hover:shadow-leaf"
            >
              <div className="font-display font-bold text-base text-fg capitalize">{q}</div>
              <div className="font-body text-sm mt-2" style={{ color: 'var(--terracotta-deep)' }}>
                → fiche culture
              </div>
            </Link>
          ))}
        </div>
      </section>

      <CTAKultiva context={`kit-${k.slug}`} />
    </div>
  );
}
