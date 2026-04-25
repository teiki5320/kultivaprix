/**
 * User preferences stored in a single cookie (no account needed).
 *
 * Pure types + parser, safe to import from client and server. The
 * server-only `getPreferences()` helper that reads cookies lives in
 * lib/preferences-server.ts.
 *
 * - region : tunes the calendar / catalog (default: France métropolitaine)
 * - level  : 'debutant' simplifies UI, 'confirme' shows extra data
 * - currency : 'EUR' (default) or 'XOF' (CFA, for West Africa)
 * - light  : 'leger' skips heavy images for low-bandwidth use
 */

export type Region = 'metropole' | 'outre-mer' | 'afrique-ouest';
export type Level = 'debutant' | 'confirme';
export type Currency = 'EUR' | 'XOF';
export type LightMode = 'normal' | 'leger';

export interface Preferences {
  region: Region;
  level: Level;
  currency: Currency;
  light: LightMode;
}

export const DEFAULT_PREFERENCES: Preferences = {
  region: 'metropole',
  level: 'debutant',
  currency: 'EUR',
  light: 'normal',
};

export const PREFS_COOKIE = 'kp_prefs';
export const PREFS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const REGIONS: { slug: Region; label: string; emoji: string }[] = [
  { slug: 'metropole', label: 'France métropolitaine', emoji: '🇫🇷' },
  { slug: 'outre-mer', label: 'Outre-mer', emoji: '🌴' },
  { slug: 'afrique-ouest', label: "Afrique de l'Ouest", emoji: '🌍' },
];

export const LEVELS: { slug: Level; label: string; emoji: string }[] = [
  { slug: 'debutant', label: 'Débutant·e', emoji: '🌱' },
  { slug: 'confirme', label: 'Confirmé·e', emoji: '🌿' },
];

export const CURRENCIES: { slug: Currency; label: string; sign: string }[] = [
  { slug: 'EUR', label: 'Euro', sign: '€' },
  { slug: 'XOF', label: 'FCFA (Afrique de l’Ouest)', sign: 'FCFA' },
];

export function parsePreferences(raw: string | undefined | null): Preferences {
  if (!raw) return { ...DEFAULT_PREFERENCES };
  try {
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      region: (['metropole', 'outre-mer', 'afrique-ouest'] as Region[]).includes(parsed.region as Region)
        ? (parsed.region as Region)
        : DEFAULT_PREFERENCES.region,
      level: (['debutant', 'confirme'] as Level[]).includes(parsed.level as Level)
        ? (parsed.level as Level)
        : DEFAULT_PREFERENCES.level,
      currency: (['EUR', 'XOF'] as Currency[]).includes(parsed.currency as Currency)
        ? (parsed.currency as Currency)
        : DEFAULT_PREFERENCES.currency,
      light: (['normal', 'leger'] as LightMode[]).includes(parsed.light as LightMode)
        ? (parsed.light as LightMode)
        : DEFAULT_PREFERENCES.light,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}
