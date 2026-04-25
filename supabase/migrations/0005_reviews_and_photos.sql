-- =========================================================================
-- User-generated content : variety reviews + garden photos.
-- All UGC defaults to status='pending' and requires explicit approval
-- before being visible to anon (RLS).
-- =========================================================================

-- ============== reviews ==============
create table if not exists kultivaprix.reviews (
  id uuid primary key default extensions.uuid_generate_v4(),
  product_id uuid not null references kultivaprix.products_master(id) on delete cascade,
  display_name text not null,
  email text,
  region text,
  rating int not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  approved_at timestamptz
);

create index if not exists idx_reviews_product on kultivaprix.reviews(product_id);
create index if not exists idx_reviews_status on kultivaprix.reviews(status);

alter table kultivaprix.reviews enable row level security;
drop policy if exists "public read approved reviews" on kultivaprix.reviews;
create policy "public read approved reviews" on kultivaprix.reviews
  for select using (status = 'approved');
grant select on kultivaprix.reviews to anon, authenticated;
grant insert, update, delete on kultivaprix.reviews to service_role;

-- ============== photos ==============
create table if not exists kultivaprix.photos (
  id uuid primary key default extensions.uuid_generate_v4(),
  product_id uuid not null references kultivaprix.products_master(id) on delete cascade,
  display_name text,
  url text not null,
  caption text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  approved_at timestamptz
);

create index if not exists idx_photos_product on kultivaprix.photos(product_id);
create index if not exists idx_photos_status on kultivaprix.photos(status);

alter table kultivaprix.photos enable row level security;
drop policy if exists "public read approved photos" on kultivaprix.photos;
create policy "public read approved photos" on kultivaprix.photos
  for select using (status = 'approved');
grant select on kultivaprix.photos to anon, authenticated;
grant insert, update, delete on kultivaprix.photos to service_role;
