import slugify from 'slugify';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://kultivaprix.com';

export const KULTIVA_APP_URL =
  process.env.NEXT_PUBLIC_KULTIVA_APP_URL ?? 'https://kultiva.app';

export function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, locale: 'fr' });
}

export function formatPrice(price?: number | null, currency = 'EUR'): string {
  if (price == null) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
}

export function formatDateFR(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

/** Deterministic integer seed from a string (for picking template variants). */
export function stringSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Pick one variant from an array in a deterministic way. */
export function pickVariant<T>(variants: T[], seed: number): T {
  return variants[seed % variants.length];
}

/** Compute cosine similarity between two vectors of same length. */
export function cosine(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
