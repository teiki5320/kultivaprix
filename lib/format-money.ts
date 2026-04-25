/**
 * Currency-aware money formatting.
 *
 * EUR is the canonical price in Supabase. XOF is computed at the fixed
 * peg rate (1 EUR = 655.957 XOF / FCFA) — that rate has been frozen
 * since 1999 so a static constant is safe.
 */
import type { Currency } from './preferences';

const RATE: Record<Currency, number> = {
  EUR: 1,
  XOF: 655.957,
};

export function convertAndFormat(price: number | null | undefined, target: Currency = 'EUR'): string {
  if (price == null) return '—';
  const value = price * RATE[target];
  if (target === 'XOF') {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(value)) + ' FCFA';
  }
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}
