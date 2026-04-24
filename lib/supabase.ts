import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * IMPORTANT — Kultivaprix partage le projet Supabase de Kultiva, mais isole
 * toutes ses tables dans le schéma dédié `kultivaprix`. Le client est configuré
 * avec `db.schema = 'kultivaprix'` par défaut, donc toutes les requêtes
 * `.from('products_master')`, `.rpc('upsert_offer', ...)` etc. ciblent
 * automatiquement `kultivaprix.<table>` sans avoir à écrire `.schema('kultivaprix')`
 * à chaque appel.
 *
 * ⚠ Pré-requis côté Supabase Dashboard :
 *   Project Settings → API → "Exposed schemas" doit contenir `kultivaprix`.
 */
export const KULTIVAPRIX_SCHEMA = 'kultivaprix' as const;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  // eslint-disable-next-line no-console
  console.warn('[kultivaprix] SUPABASE env vars missing — using placeholders');
}

/** Client public (RLS lecture). Utilisé par les pages et route handlers GET. */
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL ?? 'https://placeholder.supabase.co',
  SUPABASE_ANON ?? 'placeholder',
  {
    auth: { persistSession: false },
    db: { schema: KULTIVAPRIX_SCHEMA },
  },
);

/** Client admin (service role). JAMAIS côté client — scripts et route handlers d'écriture. */
export function supabaseAdmin(): SupabaseClient {
  if (!SUPABASE_SERVICE) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false },
    db: { schema: KULTIVAPRIX_SCHEMA },
  });
}
