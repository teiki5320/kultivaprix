/**
 * One-shot seed script for the Kultiva catalog.
 *
 * Reads scripts/seed-data/kultiva-catalog.json and upserts every entry
 * into public.species. Idempotent — safe to re-run after edits.
 *
 * Usage :
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:catalog
 *
 * In production, this script will be replaced by the edge function
 * `seed-species` triggered by Kultiva's CI workflow (option B'). This
 * script remains useful for local dev and as an emergency manual reseed.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '[seed-catalog] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

interface CatalogEntry {
  id: string;
  kind: 'species' | 'accessory';
  name: string;
  emoji: string | null;
  category: string;
  accessory_sub: string | null;
  image_asset: string | null;
  description: string | null;
  note: string | null;
  sowing_technique: string | null;
  sowing_depth: string | null;
  germination_temp: string | null;
  germination_days: string | null;
  exposure: string | null;
  spacing: string | null;
  watering: string | null;
  soil: string | null;
  watering_days_max: number | null;
  yield_estimate: string | null;
  harvest_time_by_season: Record<string, string> | null;
  amazon_url: string | null;
  regions: Record<string, unknown> | null;
}

async function main() {
  const file = path.join(process.cwd(), 'scripts/seed-data/kultiva-catalog.json');
  const entries = JSON.parse(readFileSync(file, 'utf-8')) as CatalogEntry[];

  // The DB table uses `slug` as PK, the JSON uses `id` (which is the same
  // value — Kultiva's vegetable id is already a slug like 'tomate').
  const rows = entries.map((e) => ({
    slug: e.id,
    kind: e.kind,
    name: e.name,
    emoji: e.emoji,
    category: e.category,
    accessory_sub: e.accessory_sub,
    image_asset: e.image_asset,
    image_url: null, // populated later when assets are uploaded to Supabase Storage
    description: e.description,
    note: e.note,
    sowing_technique: e.sowing_technique,
    sowing_depth: e.sowing_depth,
    germination_temp: e.germination_temp,
    germination_days: e.germination_days,
    exposure: e.exposure,
    spacing: e.spacing,
    watering: e.watering,
    soil: e.soil,
    watering_days_max: e.watering_days_max,
    yield_estimate: e.yield_estimate,
    harvest_time_by_season: e.harvest_time_by_season,
    amazon_url: e.amazon_url,
    regions: e.regions,
    updated_at: new Date().toISOString(),
  }));

  // Batch by 50 to stay under PostgREST payload limits.
  const BATCH = 50;
  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('species').upsert(slice, { onConflict: 'slug' });
    if (error) {
      console.error(`[seed-catalog] batch ${i}–${i + slice.length} failed:`, error.message);
      process.exit(1);
    }
    upserted += slice.length;
  }

  const speciesCount = entries.filter((e) => e.kind === 'species').length;
  const accessoryCount = entries.filter((e) => e.kind === 'accessory').length;
  console.log(
    `[seed-catalog] ✓ ${upserted} entries upserted (${speciesCount} species, ${accessoryCount} accessories).`,
  );
}

main().catch((e) => {
  console.error('[seed-catalog]', e);
  process.exit(1);
});
