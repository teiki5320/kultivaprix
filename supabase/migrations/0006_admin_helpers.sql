-- =========================================================================
-- Admin helpers — duplicate detection, price anomaly detection.
-- These are read-only views/functions used by the /admin pages.
-- =========================================================================

-- ============== potential_duplicates ==============
-- Pairs of products with very similar names (trigram similarity > 0.6).
-- Excludes the diagonal and (b, a) when (a, b) was already returned.
create or replace function kultivaprix.potential_duplicates(p_threshold real default 0.6, p_limit int default 50)
returns table (
  a_id uuid, a_slug text, a_name text,
  b_id uuid, b_slug text, b_name text,
  similarity real
)
language sql
stable
set search_path = kultivaprix, extensions, pg_temp
as $$
  select
    a.id, a.slug, a.name,
    b.id, b.slug, b.name,
    similarity(a.name, b.name) as sim
  from kultivaprix.products_master a
  join kultivaprix.products_master b
    on a.id < b.id
   and a.name % b.name
  where a.slug not like 'tmp-%'
    and b.slug not like 'tmp-%'
    and similarity(a.name, b.name) >= p_threshold
  order by sim desc
  limit p_limit;
$$;

grant execute on function kultivaprix.potential_duplicates(real, int)
  to authenticated, service_role;

-- ============== price_anomalies ==============
-- Offers whose price is < 50% of the median for the same product
-- (likely scraping bug / promo to verify).
create or replace function kultivaprix.price_anomalies(p_limit int default 50)
returns table (
  offer_id uuid,
  product_slug text,
  product_name text,
  merchant_slug text,
  price numeric,
  median_price numeric
)
language sql
stable
set search_path = kultivaprix, extensions, pg_temp
as $$
  with medians as (
    select product_id,
           percentile_cont(0.5) within group (order by price)::numeric as p50,
           count(*) as n
    from kultivaprix.offers
    where price is not null
    group by product_id
    having count(*) >= 3
  )
  select o.id, p.slug, p.name, m.slug, o.price, med.p50
  from kultivaprix.offers o
  join medians med on med.product_id = o.product_id
  join kultivaprix.products_master p on p.id = o.product_id
  join kultivaprix.merchants m on m.id = o.merchant_id
  where o.price < med.p50 * 0.5
  order by (med.p50 - o.price) desc
  limit p_limit;
$$;

grant execute on function kultivaprix.price_anomalies(int)
  to authenticated, service_role;
