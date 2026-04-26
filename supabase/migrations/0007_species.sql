-- =========================================================================
-- Species & accessories catalog — synchronized from Kultiva.
--
-- ARCHITECTURE (option B' — sync via CI) :
--   1. Source of truth : `public.vegetables_base` (Dart) in Kultiva repo.
--   2. CI workflow on Kultiva → exports kultiva-catalog.json → POSTs to a
--      Supabase edge function (`seed-species`) that upserts into this
--      table.
--   3. Both apps (Kultiva & Kultivaprix) read this table at runtime
--      (Kultiva will migrate later — for now keeps its hardcoded copy
--      offline-first).
--
-- The table lives in `public` (not `kultivaprix`) because it's shared
-- editorial content owned by the Kultiva product, not a kultivaprix
-- internal artefact.
-- =========================================================================

create table if not exists public.species (
  slug text primary key,                                          -- ex 'tomate', 'acc_secateur'
  kind text not null check (kind in ('species', 'accessory')),
  name text not null,
  emoji text,
  category text not null,                                         -- fruits|leaves|bulbs|tubers|seeds|roots|stems|aromatics|flowers|accessories
  accessory_sub text,                                             -- tools|pots|soil|seeds|watering|protection|structures (only when kind=accessory)
  image_asset text,                                               -- raw kultiva path, eg 'assets/images/accessories/secateur.png'
  image_url text,                                                 -- public URL once uploaded to Supabase Storage (null until then)
  description text,
  note text,
  sowing_technique text,
  sowing_depth text,
  germination_temp text,
  germination_days text,
  exposure text,
  spacing text,
  watering text,
  soil text,
  watering_days_max int,
  yield_estimate text,
  harvest_time_by_season jsonb,                                   -- {spring: "...", summer: "...", autumn: "...", winter: "..."}
  amazon_url text,                                                -- Kultiva's own affiliate URL (kept for reference, not used by Kultivaprix)
  regions jsonb,                                                  -- {france: {...}, west_africa: {...}}
  attributes jsonb default '{}'::jsonb,                           -- room for future fields without schema migration
  updated_at timestamptz default now()
);

-- Ensure all columns exist when an older `public.species` was already in place
-- before this migration was rewritten (create-if-not-exists above is a no-op
-- in that case, so the new columns must be added explicitly).
alter table public.species add column if not exists kind text;
alter table public.species add column if not exists emoji text;
alter table public.species add column if not exists category text;
alter table public.species add column if not exists accessory_sub text;
alter table public.species add column if not exists image_asset text;
alter table public.species add column if not exists image_url text;
alter table public.species add column if not exists description text;
alter table public.species add column if not exists note text;
alter table public.species add column if not exists sowing_technique text;
alter table public.species add column if not exists sowing_depth text;
alter table public.species add column if not exists germination_temp text;
alter table public.species add column if not exists germination_days text;
alter table public.species add column if not exists exposure text;
alter table public.species add column if not exists spacing text;
alter table public.species add column if not exists watering text;
alter table public.species add column if not exists soil text;
alter table public.species add column if not exists watering_days_max int;
alter table public.species add column if not exists yield_estimate text;
alter table public.species add column if not exists harvest_time_by_season jsonb;
alter table public.species add column if not exists amazon_url text;
alter table public.species add column if not exists regions jsonb;
alter table public.species add column if not exists attributes jsonb default '{}'::jsonb;
alter table public.species add column if not exists updated_at timestamptz default now();

create index if not exists idx_species_kind     on public.species(kind);
create index if not exists idx_species_category on public.species(category);
create index if not exists idx_species_name_trgm on public.species using gin (name extensions.gin_trgm_ops);

alter table public.species enable row level security;
drop policy if exists "public read species" on public.species;
create policy "public read species" on public.species for select using (true);
grant select on public.species to anon, authenticated;
grant insert, update, delete on public.species to service_role;

-- =========================================================================
-- products_master.species_slug : link from a merchant SKU to its species.
-- Replaces the previous UUID-based species_id (drop column if it exists,
-- since it was never seeded with data).
-- =========================================================================

alter table kultivaprix.products_master
  drop column if exists species_id;

alter table kultivaprix.products_master
  add column if not exists species_slug text references public.species(slug) on delete set null;

create index if not exists idx_products_species_slug
  on kultivaprix.products_master(species_slug) where species_slug is not null;

-- =========================================================================
-- match_products_to_species — auto-assign species_slug to unmatched SKUs
-- using trigram similarity on name. Skip accessories (only species are
-- worth grouping SKUs around).
-- =========================================================================

create or replace function kultivaprix.match_products_to_species(p_threshold real default 0.40)
returns int
language plpgsql
security definer
set search_path = kultivaprix, public, extensions, pg_temp
as $$
declare
  v_count int := 0;
begin
  with candidates as (
    select pm.id as product_id,
           sp.slug as species_slug,
           greatest(
             similarity(lower(pm.name), lower(sp.name)),
             case when lower(pm.name) like '%' || lower(sp.name) || '%' then 0.7 else 0 end
           ) as sim,
           row_number() over (
             partition by pm.id
             order by similarity(lower(pm.name), lower(sp.name)) desc
           ) as rk
    from kultivaprix.products_master pm
    cross join public.species sp
    where pm.species_slug is null
      and pm.slug not like 'tmp-%'
      and sp.kind = 'species'
      and (
        lower(pm.name) like '%' || lower(sp.name) || '%'
        or pm.name % sp.name
      )
  )
  update kultivaprix.products_master pm
     set species_slug = c.species_slug,
         updated_at = now()
    from candidates c
   where pm.id = c.product_id
     and c.rk = 1
     and c.sim >= p_threshold;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function kultivaprix.match_products_to_species(real)
  to service_role;

-- =========================================================================
-- species_with_stats — convenience view used by the catalog index +
-- species cards on the home page. Counts the SKUs / merchants tied to
-- each species and exposes the cheapest in-stock price.
-- =========================================================================

drop view if exists kultivaprix.species_with_stats;
create or replace view kultivaprix.species_with_stats as
  select sp.slug, sp.name, sp.kind, sp.emoji, sp.category, sp.image_url,
         sp.note, sp.regions,
         count(distinct pm.id)::int as product_count,
         count(distinct o.merchant_id)::int as merchant_count,
         min(o.price)::numeric as min_price
  from public.species sp
  left join kultivaprix.products_master pm on pm.species_slug = sp.slug and pm.slug not like 'tmp-%'
  left join kultivaprix.offers o on o.product_id = pm.id and o.in_stock = true
  group by sp.slug, sp.name, sp.kind, sp.emoji, sp.category, sp.image_url, sp.note, sp.regions;

grant select on kultivaprix.species_with_stats to anon, authenticated, service_role;
