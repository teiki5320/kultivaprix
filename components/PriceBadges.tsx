import type { PriceStats } from '@/lib/price-stats';
import { formatPrice } from '@/lib/utils';

/**
 * Compact pricing badges shown on the product page header — surfaces the
 * "best price on 30 days" and "down/up since yesterday" signals so users
 * can decide to buy now vs wait.
 */
export function PriceBadges({ stats }: { stats: PriceStats }) {
  const badges: { label: string; tone: 'brand' | 'terra' | 'sky' | 'butter' }[] = [];

  if (stats.isAtThirtyDayMin && stats.thirtyDayMin != null) {
    badges.push({ label: '⭐ Meilleur prix sur 30 j', tone: 'brand' });
  } else if (stats.thirtyDayMin != null) {
    badges.push({ label: `Plancher 30 j : ${formatPrice(stats.thirtyDayMin)}`, tone: 'sky' });
  }

  if (stats.changeSinceYesterday != null) {
    const v = stats.changeSinceYesterday;
    if (v <= -1) {
      badges.push({
        label: `↓ ${Math.abs(v).toFixed(1).replace('.', ',')}% depuis hier`,
        tone: 'brand',
      });
    } else if (v >= 1) {
      badges.push({
        label: `↑ ${v.toFixed(1).replace('.', ',')}% depuis hier`,
        tone: 'terra',
      });
    }
  }

  if (!badges.length) return null;

  const styles: Record<typeof badges[number]['tone'], React.CSSProperties> = {
    brand: { background: 'color-mix(in oklab, var(--brand) 18%, white)', color: 'var(--brand-dark)' },
    terra: { background: 'color-mix(in oklab, var(--terracotta-deep) 14%, white)', color: 'var(--terracotta-deep)' },
    sky: { background: 'var(--sky-pastel)', color: '#2D6B8F' },
    butter: { background: 'var(--butter-yellow)', color: '#7A5A1E' },
  };

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b, i) => (
        <span key={i} className="pill" style={styles[b.tone]}>
          {b.label}
        </span>
      ))}
    </div>
  );
}
