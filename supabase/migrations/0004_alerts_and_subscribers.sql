-- =========================================================================
-- Alerts (price + stock) and newsletter subscribers.
--
-- Email sending is intentionally NOT wired here — the inserts happen via
-- the `service_role` from a Next.js route. A separate worker reads
-- `alerts` and `newsletter_subscribers` and dispatches via Postmark/Resend
-- when those credentials are configured.
-- =========================================================================

-- ============== price_alerts ==============
create table if not exists kultivaprix.price_alerts (
  id uuid primary key default extensions.uuid_generate_v4(),
  email text not null,
  product_id uuid not null references kultivaprix.products_master(id) on delete cascade,
  kind text not null check (kind in ('price', 'stock', 'season')),
  threshold_eur numeric(10,2),
  region text,
  unsubscribe_token text not null default extensions.uuid_generate_v4()::text,
  created_at timestamptz default now(),
  last_notified_at timestamptz,
  notified_count int default 0,
  unique (email, product_id, kind)
);

create index if not exists idx_alerts_product on kultivaprix.price_alerts(product_id);
create index if not exists idx_alerts_email on kultivaprix.price_alerts(email);
create index if not exists idx_alerts_token on kultivaprix.price_alerts(unsubscribe_token);

alter table kultivaprix.price_alerts enable row level security;
-- No public select / update / delete. Only service_role inserts via API.
drop policy if exists "alerts owner read by token" on kultivaprix.price_alerts;
create policy "alerts owner read by token" on kultivaprix.price_alerts
  for select using (false); -- not exposed to anon
grant insert on kultivaprix.price_alerts to service_role;
grant select, update, delete on kultivaprix.price_alerts to service_role;

-- ============== newsletter_subscribers ==============
create table if not exists kultivaprix.newsletter_subscribers (
  id uuid primary key default extensions.uuid_generate_v4(),
  email text not null unique,
  region text,
  level text,
  unsubscribe_token text not null default extensions.uuid_generate_v4()::text,
  created_at timestamptz default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

create index if not exists idx_newsletter_token on kultivaprix.newsletter_subscribers(unsubscribe_token);

alter table kultivaprix.newsletter_subscribers enable row level security;
grant insert on kultivaprix.newsletter_subscribers to service_role;
grant select, update, delete on kultivaprix.newsletter_subscribers to service_role;
