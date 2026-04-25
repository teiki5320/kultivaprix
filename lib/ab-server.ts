import 'server-only';
import { cookies, headers } from 'next/headers';
import { deterministicPick, variantCookieName } from './ab';

/**
 * Returns the current variant for an experiment, server-side.
 * Reads from cookie if present, otherwise picks deterministically from the
 * user-agent so the same browser sees the same variant across visits.
 */
export function pickVariant<T extends string>(experiment: string, variants: readonly T[]): T {
  const cookie = cookies().get(variantCookieName(experiment))?.value;
  if (cookie && (variants as readonly string[]).includes(cookie)) return cookie as T;
  const ua = headers().get('user-agent') ?? 'fallback';
  return deterministicPick(`${experiment}|${ua}`, variants);
}
