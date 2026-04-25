-- =========================================================================
-- Search & similar products — pg_trgm + pgvector helpers in `kultivaprix`.
-- =========================================================================

-- ============== search_products ==============
-- Trigram similarity-based search across name + brand. Tolerant of typos
-- and accents (combined with a fallback ILIKE for very short queries).
create or replace function kultivaprix.search_products(q text, p_limit int default 24)
returns table (
  id uuid,
  slug text,
  name text,
  image_url text,
  brand text,
  min_price numeric,
  offer_count int,
  similarity real
)
language sql
stable
set search_path = kultivaprix, extensions, pg_temp
as $$
  with matches as (
    select pm.id, pm.slug, pm.name, pm.image_url, pm.brand,
           greatest(
             similarity(pm.name, q),
             coalesce(similarity(pm.brand, q), 0) * 0.7,
             case when pm.name ilike '%' || q || '%' then 0.6 else 0 end
           ) as sim
    from kultivaprix.products_master pm
    where pm.slug not like 'tmp-%'
      and (
        pm.name % q
        or coalesce(pm.brand, '') % q
        or pm.name ilike '%' || q || '%'
      )
  )
  select m.id, m.slug, m.name, m.image_url, m.brand,
         min(o.price)::numeric as min_price,
         count(distinct o.merchant_id)::int as offer_count,
         m.sim as similarity
  from matches m
  left join kultivaprix.offers o on o.product_id = m.id
  group by m.id, m.slug, m.name, m.image_url, m.brand, m.sim
  order by m.sim desc
  limit p_limit;
$$;

grant execute on function kultivaprix.search_products(text, int)
  to anon, authenticated, service_role;

-- ============== similar_products ==============
-- Cosine similarity on embedding (preferred) with trigram fallback on name.
create or replace function kultivaprix.similar_products(p_slug text, p_limit int default 6)
returns table (
  id uuid,
  slug text,
  name text,
  image_url text,
  min_price numeric,
  offer_count int
)
language plpgsql
stable
set search_path = kultivaprix, extensions, pg_temp
as $$
declare
  v_id uuid;
  v_emb extensions.vector(384);
  v_name text;
begin
  select pm.id, pm.embedding, pm.name
    into v_id, v_emb, v_name
  from kultivaprix.products_master pm
  where pm.slug = p_slug;

  if v_id is null then
    return;
  end if;

  if v_emb is not null then
    return query
      with neighbors as (
        select pm.id, pm.slug, pm.name, pm.image_url
        from kultivaprix.products_master pm
        where pm.id <> v_id
          and pm.embedding is not null
          and pm.slug not like 'tmp-%'
        order by pm.embedding <=> v_emb
        limit p_limit
      )
      select n.id, n.slug, n.name, n.image_url,
             min(o.price)::numeric, count(distinct o.merchant_id)::int
      from neighbors n
      left join kultivaprix.offers o on o.product_id = n.id
      group by n.id, n.slug, n.name, n.image_url;
  else
    return query
      with neighbors as (
        select pm.id, pm.slug, pm.name, pm.image_url,
               similarity(pm.name, v_name) as sim
        from kultivaprix.products_master pm
        where pm.id <> v_id
          and pm.slug not like 'tmp-%'
          and pm.name % split_part(v_name, ' ', 1)
        order by sim desc
        limit p_limit
      )
      select n.id, n.slug, n.name, n.image_url,
             min(o.price)::numeric, count(distinct o.merchant_id)::int
      from neighbors n
      left join kultivaprix.offers o on o.product_id = n.id
      group by n.id, n.slug, n.name, n.image_url, n.sim
      order by n.sim desc;
  end if;
end;
$$;

grant execute on function kultivaprix.similar_products(text, int)
  to anon, authenticated, service_role;
