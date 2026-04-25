-- =========================================================================
-- Species — the canonical unit visible to users on kultivaprix.
-- Source of truth: the Kultiva app catalog. Synced periodically into this
-- table; products_master rows are matched onto it by slug/name.
-- =========================================================================

create table if not exists kultivaprix.species (
  id uuid primary key default extensions.uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  -- Kultiva's own primary key for this species (when synced from there).
  kultiva_id text unique,
  family text,                         -- Solanacée, Cucurbitacée, etc.
  emoji text,
  image_url text,
  short_description text,
  -- Cultural metadata mirrored from Kultiva when available.
  exposure text check (exposure in ('soleil', 'mi-ombre', 'ombre') or exposure is null),
  sowing_months int[],                  -- e.g. {3,4,5}
  harvest_months int[],
  spacing_cm int,
  height_cm int,
  water_need text check (water_need in ('faible', 'moyen', 'élevé') or water_need is null),
  days_to_harvest int,
  region text,                          -- 'metropole' | 'outre-mer' | 'afrique-ouest' | 'all'
  attributes jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_species_family    on kultivaprix.species(family);
create index if not exists idx_species_kultiva   on kultivaprix.species(kultiva_id) where kultiva_id is not null;
create index if not exists idx_species_name_trgm on kultivaprix.species using gin (name extensions.gin_trgm_ops);

alter table kultivaprix.species enable row level security;
drop policy if exists "public read species" on kultivaprix.species;
create policy "public read species" on kultivaprix.species for select using (true);
grant select on kultivaprix.species to anon, authenticated;
grant insert, update, delete on kultivaprix.species to service_role;

-- ============== products_master.species_id ==============
alter table kultivaprix.products_master
  add column if not exists species_id uuid references kultivaprix.species(id) on delete set null;

create index if not exists idx_products_species
  on kultivaprix.products_master(species_id) where species_id is not null;

-- ============== match_products_to_species ==============
-- Auto-match unmatched products by trigram similarity on name.
-- Returns the number of rows assigned.
create or replace function kultivaprix.match_products_to_species(p_threshold real default 0.45)
returns int
language plpgsql
security definer
set search_path = kultivaprix, extensions, pg_temp
as $$
declare
  v_count int := 0;
begin
  with candidates as (
    select pm.id as product_id,
           sp.id as species_id,
           similarity(lower(pm.name), lower(sp.name)) as sim,
           row_number() over (
             partition by pm.id
             order by similarity(lower(pm.name), lower(sp.name)) desc
           ) as rk
    from kultivaprix.products_master pm
    cross join kultivaprix.species sp
    where pm.species_id is null
      and pm.slug not like 'tmp-%'
      and lower(pm.name) like '%' || lower(sp.name) || '%'
  )
  update kultivaprix.products_master pm
     set species_id = c.species_id,
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

-- ============== species_with_stats ==============
-- Convenience view: species + product count + min price (for the home grid).
create or replace view kultivaprix.species_with_stats as
  select sp.id, sp.slug, sp.name, sp.emoji, sp.image_url, sp.family, sp.sowing_months, sp.harvest_months,
         count(distinct pm.id)::int as product_count,
         count(distinct o.merchant_id)::int as merchant_count,
         min(o.price)::numeric as min_price
  from kultivaprix.species sp
  left join kultivaprix.products_master pm on pm.species_id = sp.id and pm.slug not like 'tmp-%'
  left join kultivaprix.offers o on o.product_id = pm.id and o.in_stock = true
  group by sp.id, sp.slug, sp.name, sp.emoji, sp.image_url, sp.family, sp.sowing_months, sp.harvest_months;

grant select on kultivaprix.species_with_stats to anon, authenticated, service_role;
