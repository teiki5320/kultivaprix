import Link from 'next/link';
import Image from 'next/image';
import { similarProducts } from '@/lib/search';
import { convertAndFormat } from '@/lib/format-money';
import type { Currency, LightMode } from '@/lib/preferences';

interface Props {
  slug: string;
  currency?: Currency;
  light?: LightMode;
}

export async function SimilarProducts({ slug, currency = 'EUR', light = 'normal' }: Props) {
  const items = await similarProducts(slug, 6);
  if (items.length === 0) return null;

  return (
    <section>
      <span className="kicker">🌿 Variétés proches</span>
      <h2 className="font-display text-3xl font-bold mt-3 mb-4 text-fg">Tu pourrais aussi aimer</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/produit/${p.slug}`}
            className="card-cream flex items-center gap-3 no-underline transition hover:-translate-y-1 hover:shadow-leaf"
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0 relative"
              style={{ background: 'var(--cream)' }}
            >
              {p.image_url && light !== 'leger' ? (
                <Image src={p.image_url} alt={p.name} fill sizes="64px" className="object-cover" />
              ) : (
                <span className="text-2xl" aria-hidden>🌱</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body font-bold text-sm text-fg truncate">{p.name}</div>
              <div className="text-xs text-fg-muted mt-0.5">
                {p.offer_count} marchand{p.offer_count > 1 ? 's' : ''}
              </div>
              <div
                className="font-display font-bold text-base mt-1"
                style={{ color: 'var(--terracotta-deep)' }}
              >
                {p.min_price != null ? `dès ${convertAndFormat(p.min_price, currency)}` : '—'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
