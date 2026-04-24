import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface Props {
  slug: string;
  name: string;
  imageUrl: string | null;
  minPrice: number | null;
  merchantCount: number;
}

export function ProductCard({ slug, name, imageUrl, minPrice, merchantCount }: Props) {
  return (
    <Link
      href={`/produit/${slug}`}
      className="group card-cream flex flex-col gap-3 no-underline transition hover:-translate-y-1 hover:shadow-leaf"
    >
      <div
        className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ background: 'var(--cream)' }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-5xl">🌱</span>
        )}
      </div>
      <p className="font-body font-bold text-sm leading-snug line-clamp-2 text-fg">{name}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="font-display text-lg font-bold" style={{ color: 'var(--terracotta-deep)' }}>
          {minPrice ? `dès ${formatPrice(minPrice)}` : '—'}
        </span>
        <span
          className="pill"
          style={{ background: 'color-mix(in oklab, var(--brand) 14%, white)', color: 'var(--brand-dark)' }}
        >
          {merchantCount} marchand{merchantCount > 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
}
