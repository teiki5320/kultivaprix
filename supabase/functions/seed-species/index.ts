// =============================================================================
// seed-species — upsert the Kultiva catalog (species + accessories) into
// public.species.
//
// Auth: caller must send `Authorization: Bearer ${SEED_SECRET}` where
// SEED_SECRET is set on the function (not the same as the service-role key,
// so it can live in a CI runner without granting full DB access).
//
// Body: { entries: SpeciesRow[] } — see below for the shape.
// Returns: { upserted: number, kinds: { species: number, accessory: number } }
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type SpeciesRow = {
  slug: string;
  kind: "species" | "accessory";
  name: string;
  category: string;
  emoji?: string | null;
  accessory_sub?: string | null;
  image_asset?: string | null;
  image_url?: string | null;
  description?: string | null;
  note?: string | null;
  sowing_technique?: string | null;
  sowing_depth?: string | null;
  germination_temp?: string | null;
  germination_days?: string | null;
  exposure?: string | null;
  spacing?: string | null;
  watering?: string | null;
  soil?: string | null;
  watering_days_max?: number | null;
  yield_estimate?: string | null;
  harvest_time_by_season?: Record<string, string> | null;
  amazon_url?: string | null;
  regions?: Record<string, unknown> | null;
  attributes?: Record<string, unknown> | null;
};

const REQUIRED = ["slug", "kind", "name", "category"] as const;
const VALID_KINDS = new Set(["species", "accessory"]);
const BATCH = 100;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function validate(entries: unknown): SpeciesRow[] {
  if (!Array.isArray(entries)) {
    throw new Error("`entries` must be an array");
  }
  const seen = new Set<string>();
  return entries.map((raw, i) => {
    if (!raw || typeof raw !== "object") {
      throw new Error(`entries[${i}] is not an object`);
    }
    const e = raw as Record<string, unknown>;
    for (const k of REQUIRED) {
      if (typeof e[k] !== "string" || !(e[k] as string).length) {
        throw new Error(`entries[${i}].${k} must be a non-empty string`);
      }
    }
    if (!VALID_KINDS.has(e.kind as string)) {
      throw new Error(`entries[${i}].kind must be 'species' or 'accessory'`);
    }
    const slug = e.slug as string;
    if (seen.has(slug)) {
      throw new Error(`duplicate slug '${slug}' in entries[${i}]`);
    }
    seen.add(slug);
    return e as unknown as SpeciesRow;
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  const expected = Deno.env.get("SEED_SECRET");
  if (!expected) {
    return json({ error: "SEED_SECRET is not configured" }, 500);
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${expected}`) {
    return json({ error: "unauthorized" }, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const rawEntries = (body as { entries?: unknown })?.entries;
  let entries: SpeciesRow[];
  try {
    entries = validate(rawEntries);
  } catch (err) {
    return json({ error: (err as Error).message }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" }, 500);
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const counts = { species: 0, accessory: 0 };
  for (let i = 0; i < entries.length; i += BATCH) {
    const slice = entries.slice(i, i + BATCH);
    const { error } = await supabase
      .from("species")
      .upsert(slice, { onConflict: "slug" });
    if (error) {
      return json(
        { error: `upsert failed at batch ${i / BATCH}: ${error.message}` },
        500,
      );
    }
    for (const e of slice) counts[e.kind]++;
  }

  return json({ upserted: entries.length, kinds: counts });
});
