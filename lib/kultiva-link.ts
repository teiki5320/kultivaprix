/**
 * Build links to the Kultiva app — both deep-link (kultiva://) and a
 * https fallback to the marketing site, with UTM parameters and the
 * referrer's ambassador code if it has been seen.
 */
import { KULTIVA_APP_URL } from './utils';

export const REFERRAL_COOKIE = 'kp_ref';

export interface KultivaLinkOptions {
  /** UTM campaign — what feature drove this click. */
  campaign: string;
  /** Optional product slug to deep-link straight into the planning view. */
  productSlug?: string;
  /** Optional season month (1-12) for the calendar. */
  month?: number;
  /** Ambassador referral code (read from REFERRAL_COOKIE if not passed). */
  ref?: string;
}

export function buildKultivaLink(opts: KultivaLinkOptions): string {
  const url = new URL(KULTIVA_APP_URL);
  url.searchParams.set('utm_source', 'kultivaprix');
  url.searchParams.set('utm_medium', 'cta');
  url.searchParams.set('utm_campaign', opts.campaign);
  if (opts.productSlug) url.searchParams.set('seed', opts.productSlug);
  if (opts.month) url.searchParams.set('month', String(opts.month));
  if (opts.ref) url.searchParams.set('ref', opts.ref);
  return url.toString();
}

/** Native deep-link variant — used as the `intent://` href on iOS/Android. */
export function buildKultivaDeepLink(opts: Pick<KultivaLinkOptions, 'productSlug' | 'month' | 'ref'>): string {
  const params = new URLSearchParams();
  if (opts.productSlug) params.set('seed', opts.productSlug);
  if (opts.month) params.set('month', String(opts.month));
  if (opts.ref) params.set('ref', opts.ref);
  const path = opts.productSlug ? 'plan' : opts.month ? 'calendar' : 'home';
  const qs = params.toString();
  return `kultiva://${path}${qs ? '?' + qs : ''}`;
}
