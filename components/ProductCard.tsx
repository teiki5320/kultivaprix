import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { parseQuantity, unitPrice } from '@/lib/parse-quantity';

interface Props {
  slug: string;
  name: string;
  imageUrl: string | null;
  minPrice: number | null;
  merchantCount: number;
}

export function ProductCard({ slug, name, imageUrl, minPrice, merchantCount }: Props) {
  const qty = parseQuantity(name);
  const unit = unitPrice(minPrice, qty);

  return (
    <Link
      href={`/produit/${slug}`}
      prefetch
      className="group card-cream flex flex-col gap-3 no-underline transition hover:-translate-y-1 hover:shadow-leaf"
    >
      <div
        className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center relative"
        style={{ background: 'var(--cream)' }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-5xl" aria-hidden>🌱</span>
        )}
      </div>
      <p className="font-body font-bold text-sm leading-snug line-clamp-2 text-fg">{name}</p>
      <div className="flex items-end justify-between mt-auto gap-2">
        <div className="flex flex-col">
          <span className="font-display text-lg font-bold leading-none" style={{ color: 'var(--terracotta-deep)' }}>
            {minPrice ? `dès ${formatPrice(minPrice)}` : '—'}
          </span>
          {unit && (
            <span className="text-[11px] font-body font-semibold mt-1 text-fg-subtle">
              {unit.value.toFixed(unit.value < 1 ? 3 : 2).replace('.', ',')} {unit.label}
            </span>
          )}
        </div>
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
