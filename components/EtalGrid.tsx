'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CATEGORIES, getCategoryColor, getCategoryDef } from '@/lib/etal-categories';

export interface EtalItem {
  slug: string;
  kind: 'species' | 'accessory';
  name: string;
  emoji: string | null;
  category: string;
  accessory_sub: string | null;
  image_url: string | null;
}

type FixedFilter = 'toutes' | 'accessoires';

interface Props {
  items: EtalItem[];
}

export function EtalGrid({ items }: Props) {
  const [query, setQuery] = useState('');
  const [fixedFilter, setFixedFilter] = useState<FixedFilter>('toutes');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((v) => {
      // Mode accessoires : ne montrer que les accessoires.
      if (fixedFilter === 'accessoires') {
        if (v.kind !== 'accessory') return false;
      } else {
        // Toutes : exclure les accessoires sauf si une catégorie
        // accessoires est explicitement sélectionnée.
        if (selectedCategory === null && v.kind === 'accessory') return false;
        if (selectedCategory !== null && v.category !== selectedCategory) return false;
      }
      if (q && !v.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, fixedFilter, selectedCategory]);

  // Familles à montrer dans le scroll horizontal (sans accessoires).
  const familyChips = CATEGORIES.filter((c) => c.key !== 'accessories');

  return (
    <div className="flex flex-col gap-5">
      {/* Recherche */}
      <div className="relative">
        <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted">
          🔎
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une espèce…"
          className="w-full rounded-2xl border-2 border-cream bg-white px-12 py-3 font-body text-fg placeholder:text-fg-subtle focus:outline-none focus:border-brand transition"
          aria-label="Rechercher une espèce"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Effacer"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg"
          >
            ×
          </button>
        )}
      </div>

      {/* Chips fixes Toutes / Accessoires */}
      <div className="grid grid-cols-2 gap-3">
        <FixedChip
          label="Toutes"
          emoji="✨"
          color="#4A9B5A"
          selected={fixedFilter === 'toutes'}
          onClick={() => {
            setFixedFilter('toutes');
            setSelectedCategory(null);
          }}
        />
        <FixedChip
          label="Accessoires"
          emoji="🧰"
          color="#78909C"
          selected={fixedFilter === 'accessoires'}
          onClick={() => {
            setFixedFilter('accessoires');
            setSelectedCategory(null);
          }}
        />
      </div>

      {/* Familles (scroll horizontal) - seulement en mode "Toutes" */}
      {fixedFilter === 'toutes' && (
        <div className="-mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            {familyChips.map((c) => (
              <FixedChip
                key={c.key}
                label={c.label}
                emoji={c.emoji}
                color={c.color}
                selected={selectedCategory === c.key}
                onClick={() =>
                  setSelectedCategory(selectedCategory === c.key ? null : c.key)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Compteur */}
      <div className="font-body text-sm text-fg-muted">
        {filtered.length} variété{filtered.length > 1 ? 's' : ''}
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="card-cream text-center py-12">
          <div className="text-5xl">🌱</div>
          <p className="font-display font-bold text-fg mt-4">Aucune espèce trouvée</p>
          <p className="font-body text-sm text-fg-muted mt-1">
            Essaie un autre nom ou retire les filtres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {filtered.map((v) => (
            <EtalCard key={v.slug} item={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function FixedChip({
  label,
  emoji,
  color,
  selected,
  onClick,
}: {
  label: string;
  emoji: string;
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl px-4 py-2.5 font-body font-bold text-sm transition whitespace-nowrap"
      style={{
        background: selected ? `${color}33` : '#fff',
        border: `2px solid ${color}`,
        color,
      }}
    >
      <span aria-hidden className="mr-1.5">
        {emoji}
      </span>
      {label}
    </button>
  );
}

function EtalCard({ item }: { item: EtalItem }) {
  const def = getCategoryDef(item.category);
  const color = def?.color ?? '#78909C';
  const href = item.kind === 'species' ? `/espece/${item.slug}` : `/accessoire/${item.slug}`;

  return (
    <Link
      href={href}
      className="no-underline group"
      style={{
        background: `linear-gradient(135deg, ${color}1f, ${color}40)`,
        border: `2px solid ${color}b3`,
        borderRadius: 20,
        boxShadow: `0 4px 10px ${color}33`,
        aspectRatio: '1 / 1',
      }}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center p-3 transition group-hover:-translate-y-0.5">
        <div
          className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-3xl md:text-4xl shrink-0"
          style={{ background: '#fff' }}
        >
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-1" />
          ) : (
            <span aria-hidden>{item.emoji ?? '🌱'}</span>
          )}
        </div>
        <div className="font-display font-bold text-xs md:text-sm text-fg leading-tight text-center mt-2 line-clamp-2">
          {item.name}
        </div>
        {/* Pastille couleur catégorie */}
        <span
          aria-hidden
          className="absolute bottom-2 right-2 w-2 h-2 rounded-full"
          style={{ background: color }}
        />
      </div>
    </Link>
  );
}
