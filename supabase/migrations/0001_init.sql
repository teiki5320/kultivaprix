-- =========================================================================
-- Kultivaprix — initial schema (isolé dans le projet Supabase Kultiva partagé)
--
-- Toutes les tables vivent dans le schéma `kultivaprix` pour ne pas polluer
-- le schéma `public` utilisé par l'app Kultiva. pgvector reste activé au
-- niveau projet (extension globale dans le schéma `extensions`).
--
-- À exécuter UNE FOIS dans le projet Supabase Kultiva existant via SQL Editor.
-- =========================================================================

-- Extensions (globales)
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "vector"   with schema extensions;
create extension if not exists "pg_trgm"  with schema extensions;

-- Schéma dédié
create schema if not exists kultivaprix;

-- Rend les types et fonctions des extensions visibles sans préfixe dans ce schéma
-- (vector, gen_random_uuid, uuid_generate_v4, etc. sont dans `extensions`)
grant usage on schema extensions to anon, authenticated, service_role;

-- Permissions sur le schéma kultivaprix
grant usage on schema kultivaprix to anon, authenticated, service_role;

-- ============== categories ==============
create table if not exists kultivaprix.categories (
  id uuid primary key default extensions.uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  parent_id uuid references kultivaprix.categories(id) on delete set null,
  icon text,
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_categories_parent on kultivaprix.categories(parent_id);

-- ============== products_master ==============
create table if not exists kultivaprix.products_master (
  id uuid primary key default extensions.uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  brand text,
  gtin text,
  category_id uuid references kultivaprix.categories(id) on delete set null,
  attributes jsonb default '{}'::jsonb,
  description text,
  image_url text,
  embedding extensions.vector(384),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_category on kultivaprix.products_master(category_id);
create index if not exists idx_products_gtin
  on kultivaprix.products_master(gtin) where gtin is not null;
create index if not exists idx_products_name_trgm
  on kultivaprix.products_master using gin (name extensions.gin_trgm_ops);
create index if not exists idx_products_embedding
  on kultivaprix.products_master
  using ivfflat (embedding extensions.vector_cosine_ops) with (lists = 100);

-- ============== merchants ==============
create table if not exists kultivaprix.merchants (
  id uuid primary key default extensions.uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  program text,
  program_advertiser_id text,
  base_url text,
  logo_url text,
  enabled boolean default true,
  created_at timestamptz default now()
);

-- ============== offers ==============
create table if not exists kultivaprix.offers (
  id uuid primary key default extensions.uuid_generate_v4(),
  product_id uuid not null references kultivaprix.products_master(id) on delete cascade,
  merchant_id uuid not null references kultivaprix.merchants(id) on delete cascade,
  merchant_sku text,
  title text not null,
  url text not null,
  image_url text,
  price numeric(10,2),
  currency text default 'EUR',
  in_stock boolean default true,
  shipping_cost numeric(10,2),
  last_seen_at timestamptz default now(),
  raw jsonb,
  created_at timestamptz default now(),
  unique (merchant_id, merchant_sku)
);

create index if not exists idx_offers_product on kultivaprix.offers(product_id);
create index if not exists idx_offers_merchant on kultivaprix.offers(merchant_id);
create index if not exists idx_offers_price on kultivaprix.offers(price);

-- ============== price_history ==============
create table if not exists kultivaprix.price_history (
  id bigserial primary key,
  offer_id uuid not null references kultivaprix.offers(id) on delete cascade,
  product_id uuid not null references kultivaprix.products_master(id) on delete cascade,
  merchant_id uuid not null references kultivaprix.merchants(id) on delete cascade,
  price numeric(10,2) not null,
  currency text default 'EUR',
  in_stock boolean default true,
  recorded_at timestamptz default now()
);

create index if not exists idx_price_history_product_date
  on kultivaprix.price_history(product_id, recorded_at desc);
create index if not exists idx_price_history_offer_date
  on kultivaprix.price_history(offer_id, recorded_at desc);

-- ============== articles ==============
create table if not exists kultivaprix.articles (
  id uuid primary key default extensions.uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  kind text not null default 'guide',
  category_id uuid references kultivaprix.categories(id) on delete set null,
  product_id uuid references kultivaprix.products_master(id) on delete set null,
  body_md text not null,
  template_key text,
  variant_seed int,
  published_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_articles_category on kultivaprix.articles(category_id);
create index if not exists idx_articles_product on kultivaprix.articles(product_id);

-- ============== clicks ==============
create table if not exists kultivaprix.clicks (
  id bigserial primary key,
  offer_id uuid not null references kultivaprix.offers(id) on delete cascade,
  product_id uuid references kultivaprix.products_master(id) on delete set null,
  merchant_id uuid references kultivaprix.merchants(id) on delete set null,
  user_hash text,
  referer text,
  utm jsonb,
  clicked_at timestamptz default now()
);

create index if not exists idx_clicks_offer_date on kultivaprix.clicks(offer_id, clicked_at desc);
create index if not exists idx_clicks_product_date on kultivaprix.clicks(product_id, clicked_at desc);

-- =========================================================================
-- RLS — lecture publique pour tables d'affichage, écriture via service role
-- =========================================================================
alter table kultivaprix.categories        enable row level security;
alter table kultivaprix.products_master   enable row level security;
alter table kultivaprix.merchants         enable row level security;
alter table kultivaprix.offers            enable row level security;
alter table kultivaprix.price_history     enable row level security;
alter table kultivaprix.articles          enable row level security;
alter table kultivaprix.clicks            enable row level security;

-- idempotent: drop then create (pour rejouer la migration sans erreur)
drop policy if exists "public read categories"      on kultivaprix.categories;
drop policy if exists "public read products_master" on kultivaprix.products_master;
drop policy if exists "public read merchants"       on kultivaprix.merchants;
drop policy if exists "public read offers"          on kultivaprix.offers;
drop policy if exists "public read price_history"   on kultivaprix.price_history;
drop policy if exists "public read articles"        on kultivaprix.articles;

create policy "public read categories"      on kultivaprix.categories      for select using (true);
create policy "public read products_master" on kultivaprix.products_master for select using (true);
create policy "public read merchants"       on kultivaprix.merchants       for select using (enabled = true);
create policy "public read offers"          on kultivaprix.offers          for select using (true);
create policy "public read price_history"   on kultivaprix.price_history   for select using (true);
create policy "public read articles"        on kultivaprix.articles        for select using (true);

-- clicks : pas de select public (confidentiel), insert via service role

-- Droits d'exécution — anon peut lire, service_role peut tout faire
grant select on all tables in schema kultivaprix to anon, authenticated;
alter default privileges in schema kultivaprix
  grant select on tables to anon, authenticated;

grant insert, update, delete on all tables in schema kultivaprix to service_role;
grant usage, select on all sequences in schema kultivaprix to service_role;
alter default privileges in schema kultivaprix
  grant insert, update, delete on tables to service_role;

-- =========================================================================
-- RPC — upsert_offer (dans le schéma kultivaprix)
-- =========================================================================
create or replace function kultivaprix.upsert_offer(
  p_product_id uuid,
  p_merchant_id uuid,
  p_merchant_sku text,
  p_title text,
  p_url text,
  p_image_url text,
  p_price numeric,
  p_currency text,
  p_in_stock boolean,
  p_shipping_cost numeric,
  p_raw jsonb
) returns uuid
language plpgsql
security definer
set search_path = kultivaprix, extensions, pg_temp
as $$
declare
  v_offer_id uuid;
  v_prev_price numeric;
  v_prev_stock boolean;
begin
  select id, price, in_stock into v_offer_id, v_prev_price, v_prev_stock
  from kultivaprix.offers
  where merchant_id = p_merchant_id and merchant_sku = p_merchant_sku;

  if v_offer_id is null then
    insert into kultivaprix.offers
      (product_id, merchant_id, merchant_sku, title, url, image_url,
       price, currency, in_stock, shipping_cost, raw, last_seen_at)
    values
      (p_product_id, p_merchant_id, p_merchant_sku, p_title, p_url, p_image_url,
       p_price, p_currency, p_in_stock, p_shipping_cost, p_raw, now())
    returning id into v_offer_id;
  else
    update kultivaprix.offers set
      product_id = p_product_id,
      title = p_title,
      url = p_url,
      image_url = coalesce(p_image_url, image_url),
      price = p_price,
      currency = p_currency,
      in_stock = p_in_stock,
      shipping_cost = p_shipping_cost,
      raw = p_raw,
      last_seen_at = now()
    where id = v_offer_id;
  end if;

  if v_prev_price is distinct from p_price
     or v_prev_stock is distinct from p_in_stock then
    insert into kultivaprix.price_history
      (offer_id, product_id, merchant_id, price, currency, in_stock)
    values
      (v_offer_id, p_product_id, p_merchant_id, p_price, p_currency, p_in_stock);
  end if;

  return v_offer_id;
end;
$$;

-- Expose la fonction à PostgREST
grant execute on function kultivaprix.upsert_offer(uuid, uuid, text, text, text, text, numeric, text, boolean, numeric, jsonb)
  to service_role;

-- =========================================================================
-- IMPORTANT : étape manuelle dans Supabase Dashboard
-- =========================================================================
-- Project Settings → API → "Exposed schemas" → ajoute `kultivaprix`
-- (sinon PostgREST ne servira pas les tables via les clients anon/service_role).
-- =========================================================================
