import Link from 'next/link';
import Image from 'next/image';

type Kind = 'species' | 'accessory';

interface Props {
  slug: string;
  name: string;
  emoji: string | null;
  imageUrl: string | null;
  kind: Kind;
  light?: 'normal' | 'leger';
}

export function SpeciesCard({ slug, name, emoji, imageUrl, kind, light = 'normal' }: Props) {
  const href = kind === 'species' ? `/espece/${slug}` : `/accessoire/${slug}`;
  return (
    <Link
      href={href}
      prefetch
      className="group card-cream flex flex-col gap-3 no-underline transition hover:-translate-y-1 hover:shadow-leaf"
    >
      <div
        className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center relative"
        style={{ background: 'var(--cream)' }}
      >
        {imageUrl && light !== 'leger' ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-6xl" aria-hidden>{emoji ?? (kind === 'species' ? '🌱' : '🪴')}</span>
        )}
      </div>
      <p className="font-body font-bold text-sm leading-snug line-clamp-2 text-fg text-center">
        {name}
      </p>
    </Link>
  );
}
