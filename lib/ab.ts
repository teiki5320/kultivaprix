/**
 * Tiny cookie-based A/B framework — pure code, no third-party SDK.
 *
 * Usage:
 *   const variant = pickVariant('hero-cta', ['A', 'B']);
 *   if (variant === 'B') ...
 *
 * Server-side picks live in lib/ab-server.ts (reads cookies via next/headers).
 * Client-side, the variant is read from document.cookie, falling back to a
 * deterministic hash on user-agent so SSR + client agree.
 */

const VARIANT_COOKIE_PREFIX = 'kp_ab_';

export function variantCookieName(experiment: string): string {
  return VARIANT_COOKIE_PREFIX + experiment.replace(/[^a-z0-9_-]/gi, '_');
}

export function deterministicPick<T extends string>(seed: string, variants: readonly T[]): T {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return variants[Math.abs(h) % variants.length];
}
