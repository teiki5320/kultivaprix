/**
 * Price stats helpers — compute "best price on 30 days", price changes,
 * and trend from a price_history series.
 */

export interface PricePoint {
  price: number;
  recorded_at: string;
}

export interface PriceStats {
  thirtyDayMin: number | null;
  thirtyDayMax: number | null;
  thirtyDayAvg: number | null;
  /** True if current price equals the 30-day minimum (within 1 cent). */
  isAtThirtyDayMin: boolean;
  /** Pct change vs the most recent point older than ~26h (null if not enough data). */
  changeSinceYesterday: number | null;
  trend: 'down' | 'up' | 'flat' | null;
}

const DAY_MS = 86_400_000;

export function computePriceStats(currentPrice: number | null, history: PricePoint[]): PriceStats {
  const now = Date.now();
  const past30 = history.filter((h) => now - new Date(h.recorded_at).getTime() < 30 * DAY_MS);

  if (!past30.length || currentPrice == null) {
    return {
      thirtyDayMin: null,
      thirtyDayMax: null,
      thirtyDayAvg: null,
      isAtThirtyDayMin: false,
      changeSinceYesterday: null,
      trend: null,
    };
  }

  const prices = past30.map((h) => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

  const cutoff = now - 26 * 3_600_000;
  const beforeYesterday = past30.filter((h) => new Date(h.recorded_at).getTime() < cutoff);
  const previous = beforeYesterday.length ? beforeYesterday[beforeYesterday.length - 1].price : null;

  const change = previous != null && previous > 0
    ? ((currentPrice - previous) / previous) * 100
    : null;

  const trend: PriceStats['trend'] = change == null ? null : change < -1 ? 'down' : change > 1 ? 'up' : 'flat';

  return {
    thirtyDayMin: min,
    thirtyDayMax: max,
    thirtyDayAvg: avg,
    isAtThirtyDayMin: Math.abs(currentPrice - min) < 0.01,
    changeSinceYesterday: change,
    trend,
  };
}
