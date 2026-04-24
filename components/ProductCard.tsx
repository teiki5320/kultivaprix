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
      className="card-kawaii flex flex-col gap-2 no-underline hover:shadow-leaf transition"
    >
      <div className="aspect-square bg-kawaii-cream rounded-xl overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-5xl">🌱</span>
        )}
      </div>
      <p className="font-semibold line-clamp-2 text-kawaii-ink">{name}</p>
      <div className="flex items-center justify-between">
        <span className="font-display text-lg text-kawaii-pink-600">
          {minPrice ? `dès ${formatPrice(minPrice)}` : '—'}
        </span>
        <span className="pill bg-kawaii-green-100 text-kawaii-green-600">
          {merchantCount} marchand{merchantCount > 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
}
