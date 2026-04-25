import 'server-only';
import { cookies } from 'next/headers';
import { parsePreferences, PREFS_COOKIE, type Preferences } from './preferences';

/** Server-only — reads the prefs cookie via next/headers. */
export function getPreferences(): Preferences {
  const c = cookies().get(PREFS_COOKIE)?.value;
  return parsePreferences(c);
}
