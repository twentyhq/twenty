-- =============================================================================
-- XO2 Affiliate Platform Core Schema
-- Baseline source-controlled version of the live Supabase schema used by XO Pure.
-- This migration is intentionally additive/idempotent for the application tables.
-- =============================================================================

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

do $$ begin
  create type public.app_role as enum ('admin', 'moderator', 'user');
exception when duplicate_object then null;
end $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku varchar(100) not null unique,
  name varchar(255) not null,
  description text,
  price_cents integer not null,
  currency varchar(3) not null default 'USD',
  image_url text,
  category varchar(100),
  active boolean not null default true,
  metadata jsonb,
  stock_quantity integer,
  slug text unique,
  pre_order boolean default false,
  featured boolean default false,
  product_url text,
  sheet_row_id text,
  synced_at timestamptz,
  commission_plan_id uuid,
  cv_amount integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commission_plans (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  tiers_enabled smallint not null default 3,
  tier_percentages numeric[] not null default '{20,5,2}',
  scope varchar(20) not null default 'global',
  scope_ref uuid,
  is_default boolean not null default false,
  launch_bonus_cents integer default 0,
  global_bonus_pool_pct numeric(5,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

do $$ begin
  alter table public.products
    add constraint products_commission_plan_id_fkey
    foreign key (commission_plan_id) references public.commission_plans(id) not valid;
exception when duplicate_object or undefined_object then null;
end $$;

do $$ begin
  alter table public.products validate constraint products_commission_plan_id_fkey;
exception when undefined_object then null;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role::public.app_role
  )
$$;

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email varchar(255) not null unique,
  name varchar(255) not null,
  tracking_code varchar(50) not null unique,
  parent_id uuid references public.affiliates(id),
  commission_plan_id uuid references public.commission_plans(id),
  payout_details jsonb,
  status varchar(20) not null default 'pending',
  social_handle text,
  audience_size text,
  reason text,
  rank text default 'affiliate',
  account_type text default 'ambassador',
  ambassador_conversion_date timestamptz,
  active_customer_count integer default 0,
  personal_volume_cents integer default 0,
  team_volume_cents integer default 0,
  career_rank text default 'active_affiliate',
  paid_as_rank text default 'active_affiliate',
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code varchar(50) not null unique,
  type varchar(20) not null,
  value integer not null,
  min_order_cents integer default 0,
  max_uses integer,
  current_uses integer not null default 0,
  affiliate_id uuid references public.affiliates(id),
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_email varchar(255) not null,
  customer_id uuid references auth.users(id),
  subtotal_cents integer not null,
  discount_code_id uuid references public.discount_codes(id),
  discount_amount_cents integer default 0,
  shipping_cents integer default 0,
  tax_cents integer default 0,
  total_cents integer,
  refund_amount_cents integer default 0,
  currency varchar(3) not null default 'USD',
  affiliate_chain uuid[],
  commission_plan_id uuid references public.commission_plans(id),
  commission_amounts integer[],
  payment_gateway varchar(50) not null default 'stripe',
  payment_status varchar(30) not null default 'pending',
  gateway_payload jsonb,
  shipping_address jsonb,
  items jsonb not null default '[]',
  event_type text,
  cv_amount integer,
  buyer_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  sku varchar(100) not null,
  name varchar(255) not null,
  unit_price_cents integer not null,
  quantity integer not null default 1,
  line_total_cents integer not null,
  category varchar(100),
  cv_amount integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id),
  order_id uuid not null references public.orders(id),
  level smallint not null,
  amount_cents integer not null,
  status varchar(20) not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  page_url text not null default '/',
  referrer text,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_attributions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  affiliate_id uuid not null references public.affiliates(id),
  chain_snapshot jsonb not null,
  plan_snapshot jsonb not null,
  tracking_code varchar(50) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.commission_config_versions (
  id uuid primary key default gen_random_uuid(),
  effective_start_date date not null,
  effective_end_date date,
  commissionable_rate numeric(5,4) not null default 0.30,
  commission_hold_days integer not null default 14,
  min_payout_cents integer not null default 5000,
  max_total_payout_pct numeric(5,4) not null default 1.00,
  active_affiliate_rule_enabled boolean not null default true,
  refund_clawback_enabled boolean not null default true,
  compression_enabled boolean not null default true,
  fast_start_enabled boolean not null default true,
  fast_start_l1_pct numeric(5,4) not null default 0.40,
  fast_start_l2_pct numeric(5,4) not null default 0.20,
  fast_start_l3_pct numeric(5,4) not null default 0.10,
  fast_start_compression_mode text not null default 'compress',
  generation_enabled boolean not null default true,
  generation_g1_pct numeric(5,4) not null default 0.04,
  generation_g2_pct numeric(5,4) not null default 0.04,
  generation_g3_pct numeric(5,4) not null default 0.04,
  generation_g4_pct numeric(5,4) not null default 0.04,
  generation_g5_pct numeric(5,4) not null default 0.04,
  generation_pool_cap_pct numeric(5,4) not null default 0.25,
  generation_threshold_rank text not null default 'elite_leader',
  generation_compression_mode text not null default 'compress',
  direct_bonus_enabled boolean not null default true,
  direct_bonus_tier1_pct numeric(5,4) not null default 0.05,
  direct_bonus_tier1_volume_cents integer not null default 500000,
  direct_bonus_tier2_pct numeric(5,4) not null default 0.10,
  direct_bonus_tier2_volume_cents integer not null default 1000000,
  direct_bonus_tier_mode text not null default 'highest_only',
  direct_bonus_volume_basis text not null default 'personally_enrolled_volume',
  customer_commission_enabled boolean not null default true,
  customer_commission_compression_mode text not null default 'none',
  customer_commission_eligible_event_types text[] not null default '{CUSTOMER_FIRST_ORDER,CUSTOMER_RECURRING_ORDER}',
  personal_sub_enabled boolean not null default true,
  personal_sub_pct numeric(5,4) not null default 0.12,
  personal_sub_min_customers integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commission_ledger (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  order_item_id uuid references public.order_items(id),
  attribution_id uuid references public.affiliate_attributions(id),
  affiliate_id uuid not null references public.affiliates(id),
  level smallint,
  percentage_bps integer,
  amount_cents integer not null,
  status varchar(20) not null default 'held',
  hold_until timestamptz,
  paid_at timestamptz,
  batch_id uuid,
  plan_snapshot_json jsonb,
  pay_area text,
  explanation text,
  calculation_trace_json jsonb,
  compressed_from_id uuid references public.affiliates(id),
  compression_reason text,
  config_version_id uuid references public.commission_config_versions(id),
  source_affiliate_id uuid references public.affiliates(id),
  base_cv_amount integer,
  rate_used numeric(8,5),
  period_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  gateway varchar(50) not null,
  gateway_event_id varchar(255) not null,
  event_type varchar(50) not null,
  payload jsonb not null,
  processed boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (gateway, gateway_event_id)
);

create table if not exists public.affiliate_click_events (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id),
  tracking_code varchar(50) not null,
  page_url text not null default '/',
  referrer text,
  ip_address inet,
  user_agent text,
  fingerprint varchar(64),
  is_suspicious boolean not null default false,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.fraud_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  affiliate_id uuid references public.affiliates(id),
  review_type varchar(50) not null,
  evidence jsonb not null,
  status varchar(20) not null default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_expertise (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade unique,
  expertise_data jsonb not null default '{}',
  recommendation_cache jsonb default '{}',
  drip_state jsonb default '{}',
  total_interactions integer not null default 0,
  last_interaction_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  key varchar(100) not null unique,
  value jsonb not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  source varchar(50) not null default 'google_sheets',
  rows_synced integer default 0,
  rows_changed integer default 0,
  status varchar(20) not null default 'running',
  duration_ms integer,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.server_carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id),
  session_id varchar(255),
  items jsonb not null default '[]',
  affiliate_code varchar(50),
  status varchar(20) not null default 'active',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint chk_server_carts_identity check (customer_id is not null or session_id is not null)
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id),
  session_id text,
  answers jsonb not null default '{}',
  recommended_products uuid[] default '{}',
  discount_code_id uuid references public.discount_codes(id),
  created_at timestamptz default now(),
  constraint chk_quiz_results_identity check (customer_id is not null or session_id is not null)
);

create table if not exists public.rank_definitions (
  id uuid primary key default gen_random_uuid(),
  rank_code text not null unique,
  rank_name text not null,
  rank_order integer not null,
  min_active_customers integer not null default 0,
  min_personal_volume_cents integer not null default 0,
  min_team_volume_cents integer not null default 0,
  requires_active_subscription boolean not null default true,
  unlocked_generations integer not null default 0,
  customer_commission_pct numeric(5,4) not null default 0.20,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commission_periods (
  id uuid primary key default gen_random_uuid(),
  period_id text not null unique,
  status text not null default 'pending',
  config_version_id uuid references public.commission_config_versions(id),
  total_eligible_cv_cents bigint,
  total_generation_cv_cents bigint,
  generation_scale_factor numeric(10,8),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.period_snapshots (
  id uuid primary key default gen_random_uuid(),
  period_id text not null,
  affiliate_id uuid not null references public.affiliates(id),
  sponsor_id uuid references public.affiliates(id),
  paid_as_rank text not null default 'active_affiliate',
  career_rank text not null default 'active_affiliate',
  active_flag boolean not null default false,
  active_customer_count integer not null default 0,
  personal_volume_cents bigint not null default 0,
  team_volume_cents bigint not null default 0,
  customer_ownership jsonb default '[]',
  genealogy_path uuid[] default '{}',
  unlocked_generations integer not null default 0,
  active_subscription_flag boolean not null default false,
  created_at timestamptz not null default now(),
  unique (period_id, affiliate_id)
);

alter table public.products enable row level security;
alter table public.commission_plans enable row level security;
alter table public.user_roles enable row level security;
alter table public.affiliates enable row level security;
alter table public.orders enable row level security;
alter table public.affiliate_payouts enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.store_settings enable row level security;
alter table public.sync_logs enable row level security;
alter table public.discount_codes enable row level security;
alter table public.order_items enable row level security;
alter table public.affiliate_attributions enable row level security;
alter table public.commission_ledger enable row level security;
alter table public.payment_events enable row level security;
alter table public.affiliate_click_events enable row level security;
alter table public.fraud_reviews enable row level security;
alter table public.customer_expertise enable row level security;
alter table public.server_carts enable row level security;
alter table public.quiz_results enable row level security;
alter table public.commission_config_versions enable row level security;
alter table public.rank_definitions enable row level security;
alter table public.commission_periods enable row level security;
alter table public.period_snapshots enable row level security;

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_active on public.products(active);
create index if not exists idx_products_commission_plan_id on public.products(commission_plan_id);
create index if not exists idx_affiliates_tracking_code on public.affiliates(tracking_code);
create index if not exists idx_affiliates_parent_id on public.affiliates(parent_id);
create index if not exists idx_affiliates_account_type on public.affiliates(account_type);
create index if not exists idx_affiliates_paid_as_rank on public.affiliates(paid_as_rank);
create index if not exists idx_orders_user_email on public.orders(user_email);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_event_type on public.orders(event_type);
create index if not exists idx_orders_buyer_type on public.orders(buyer_type);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_commission_ledger_status on public.commission_ledger(status);
create index if not exists idx_commission_ledger_held_until on public.commission_ledger(hold_until) where status = 'held';
create index if not exists idx_commission_ledger_affiliate_id on public.commission_ledger(affiliate_id);
create index if not exists idx_commission_ledger_order_id on public.commission_ledger(order_id);
create index if not exists idx_commission_ledger_pay_area on public.commission_ledger(pay_area);
create index if not exists idx_commission_ledger_period_id on public.commission_ledger(period_id);
create index if not exists idx_commission_ledger_source_affiliate on public.commission_ledger(source_affiliate_id);
create index if not exists idx_commission_ledger_config_version on public.commission_ledger(config_version_id);
create index if not exists idx_customer_expertise_customer_id on public.customer_expertise(customer_id);
create index if not exists idx_customer_expertise_drip_state on public.customer_expertise using gin (drip_state);
create index if not exists idx_discount_codes_active_expires on public.discount_codes(active, expires_at);
create index if not exists idx_server_carts_customer_id on public.server_carts(customer_id);
create index if not exists idx_server_carts_session_id on public.server_carts(session_id);
create index if not exists idx_affiliate_attributions_order_id on public.affiliate_attributions(order_id);
create index if not exists idx_affiliate_attributions_affiliate_id on public.affiliate_attributions(affiliate_id);
create index if not exists idx_config_versions_effective on public.commission_config_versions(effective_start_date, effective_end_date);
create index if not exists idx_rank_definitions_rank_order on public.rank_definitions(rank_order);
create index if not exists idx_rank_definitions_active on public.rank_definitions(is_active) where is_active = true;
create index if not exists idx_commission_periods_status on public.commission_periods(status);
create index if not exists idx_period_snapshots_period_id on public.period_snapshots(period_id);
create index if not exists idx_period_snapshots_affiliate_id on public.period_snapshots(affiliate_id);
create index if not exists idx_period_snapshots_sponsor_id on public.period_snapshots(sponsor_id);
create index if not exists idx_quiz_results_customer_id on public.quiz_results(customer_id);
create index if not exists idx_quiz_results_session_id on public.quiz_results(session_id);

-- Public/customer-safe policies.
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone" on public.products for select using (true);

drop policy if exists "Plans viewable by authenticated users" on public.commission_plans;
create policy "Plans viewable by authenticated users" on public.commission_plans for select to authenticated using (true);

drop policy if exists "Users can view own roles" on public.user_roles;
create policy "Users can view own roles" on public.user_roles for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Affiliates can view own record" on public.affiliates;
drop policy if exists "Anyone can submit affiliate application" on public.affiliates;
drop policy if exists "Affiliates can update own payout details" on public.affiliates;
drop policy if exists "Public can lookup affiliate by tracking code" on public.affiliates;
create policy "Affiliates can view own record" on public.affiliates for select to authenticated using ((select auth.uid()) = user_id);
create policy "Anyone can submit affiliate application" on public.affiliates for insert to authenticated with check ((select auth.uid()) = user_id and email is not null and name is not null and tracking_code is not null and status = 'pending');
create policy "Affiliates can update own payout details" on public.affiliates for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Public can lookup affiliate by tracking code" on public.affiliates for select to public using (status = 'approved');

drop policy if exists "Orders can be created with valid data" on public.orders;
drop policy if exists "Users can view own orders" on public.orders;
create policy "Orders can be created with valid data" on public.orders for insert with check (user_email is not null and subtotal_cents > 0 and payment_status = 'pending');
create policy "Users can view own orders" on public.orders for select to authenticated using (customer_id = (select auth.uid()));

drop policy if exists "Affiliates can view own payouts" on public.affiliate_payouts;
create policy "Affiliates can view own payouts" on public.affiliate_payouts for select to authenticated using (affiliate_id in (select id from public.affiliates where user_id = (select auth.uid())));

drop policy if exists "Affiliates can view own ledger" on public.commission_ledger;
create policy "Affiliates can view own ledger" on public.commission_ledger for select to authenticated using (affiliate_id in (select id from public.affiliates where user_id = (select auth.uid())));

drop policy if exists "Anyone can record clicks" on public.affiliate_clicks;
create policy "Anyone can record clicks" on public.affiliate_clicks for insert to public with check (true);

drop policy if exists "Public can read store settings" on public.store_settings;
create policy "Public can read store settings" on public.store_settings for select using (true);

drop policy if exists "Anyone can view active discount codes" on public.discount_codes;
create policy "Anyone can view active discount codes" on public.discount_codes for select using (active = true);

-- Admin policies for operational tables.
drop policy if exists "Admin full access to discount codes" on public.discount_codes;
create policy "Admin full access to discount codes" on public.discount_codes for all to authenticated using (public.has_role((select auth.uid()), 'admin')) with check (public.has_role((select auth.uid()), 'admin'));

drop policy if exists "Admin full access to order items" on public.order_items;
create policy "Admin full access to order items" on public.order_items for all to authenticated using (public.has_role((select auth.uid()), 'admin')) with check (public.has_role((select auth.uid()), 'admin'));

drop policy if exists "Admin full access to commission ledger" on public.commission_ledger;
create policy "Admin full access to commission ledger" on public.commission_ledger for all to authenticated using (public.has_role((select auth.uid()), 'admin')) with check (public.has_role((select auth.uid()), 'admin'));

drop policy if exists "Admin full access to payment events" on public.payment_events;
create policy "Admin full access to payment events" on public.payment_events for all to authenticated using (public.has_role((select auth.uid()), 'admin')) with check (public.has_role((select auth.uid()), 'admin'));

drop policy if exists "Admin full access to click events" on public.affiliate_click_events;
create policy "Admin full access to click events" on public.affiliate_click_events for all to authenticated using (public.has_role((select auth.uid()), 'admin')) with check (public.has_role((select auth.uid()), 'admin'));

drop policy if exists "Admin full access to fraud reviews" on public.fraud_reviews;
create policy "Admin full access to fraud reviews" on public.fraud_reviews for all to authenticated using (public.has_role((select auth.uid()), 'admin')) with check (public.has_role((select auth.uid()), 'admin'));

drop policy if exists "Admin full access to sync logs" on public.sync_logs;
create policy "Admin full access to sync logs" on public.sync_logs for all to authenticated using (public.has_role((select auth.uid()), 'admin')) with check (public.has_role((select auth.uid()), 'admin'));

drop policy if exists "Admin full access to affiliate attributions" on public.affiliate_attributions;
create policy "Admin full access to affiliate attributions" on public.affiliate_attributions for all to authenticated using (public.has_role((select auth.uid()), 'admin')) with check (public.has_role((select auth.uid()), 'admin'));

drop policy if exists "Users can view own expertise" on public.customer_expertise;
drop policy if exists "Users can update own expertise" on public.customer_expertise;
drop policy if exists "Admin full access to customer expertise" on public.customer_expertise;
create policy "Users can view own expertise" on public.customer_expertise for select to authenticated using (customer_id = (select auth.uid()));
create policy "Users can update own expertise" on public.customer_expertise for update to authenticated using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()));
create policy "Admin full access to customer expertise" on public.customer_expertise for all to authenticated using (public.has_role((select auth.uid()), 'admin')) with check (public.has_role((select auth.uid()), 'admin'));

drop policy if exists "Public can read commission config" on public.commission_config_versions;
create policy "Public can read commission config" on public.commission_config_versions for select using (true);

drop policy if exists "Public can read rank definitions" on public.rank_definitions;
create policy "Public can read rank definitions" on public.rank_definitions for select using (true);

-- Updated-at triggers.
do $$ declare t text; begin
  foreach t in array array[
    'products','orders','affiliates','commission_plans','store_settings','discount_codes',
    'order_items','commission_ledger','fraud_reviews','customer_expertise','server_carts',
    'commission_config_versions','rank_definitions','commission_periods'
  ] loop
    execute format('drop trigger if exists update_%I_updated_at on public.%I', t, t);
    execute format('create trigger update_%I_updated_at before update on public.%I for each row execute function public.update_updated_at_column()', t, t);
  end loop;
end $$;

create or replace function public.check_affiliate_chain_depth()
returns trigger as $$
declare chain_depth integer;
begin
  if new.parent_id is null then return new; end if;
  if new.parent_id = new.id then raise exception 'Affiliate cannot be its own parent'; end if;
  with recursive chain as (
    select parent_id, 1 as depth, array[new.id] as visited from public.affiliates where id = new.parent_id
    union all
    select a.parent_id, c.depth + 1, c.visited || a.id
    from public.affiliates a join chain c on a.id = c.parent_id
    where c.depth < 6 and not (a.id = any(c.visited))
  ) select max(depth) into chain_depth from chain;
  if chain_depth >= 5 then raise exception 'Affiliate chain depth cannot exceed 5 levels (current: %)', chain_depth + 1; end if;
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists enforce_affiliate_chain_depth on public.affiliates;
create trigger enforce_affiliate_chain_depth before insert or update of parent_id on public.affiliates for each row execute function public.check_affiliate_chain_depth();

create or replace function public.prevent_attribution_update()
returns trigger as $$
begin
  raise exception 'affiliate_attributions rows are immutable after creation';
end;
$$ language plpgsql;

drop trigger if exists trg_prevent_attribution_update on public.affiliate_attributions;
create trigger trg_prevent_attribution_update before update on public.affiliate_attributions for each row execute function public.prevent_attribution_update();

create or replace function public.get_active_commission_config(target_date date default current_date)
returns public.commission_config_versions as $$
  select * from public.commission_config_versions
  where effective_start_date <= target_date and (effective_end_date is null or effective_end_date >= target_date)
  order by effective_start_date desc limit 1;
$$ language sql stable set search_path = public;

create or replace function public.evaluate_affiliate_rank(
  p_active_customer_count integer,
  p_personal_volume_cents bigint,
  p_team_volume_cents bigint,
  p_has_active_subscription boolean
)
returns public.rank_definitions as $$
  select * from public.rank_definitions
  where is_active = true
    and (not requires_active_subscription or p_has_active_subscription)
    and min_active_customers <= p_active_customer_count
    and min_personal_volume_cents <= p_personal_volume_cents
    and min_team_volume_cents <= p_team_volume_cents
  order by rank_order desc limit 1;
$$ language sql stable set search_path = public;

create materialized view if not exists public.mv_affiliate_performance as
select
  a.id as affiliate_id,
  a.name as affiliate_name,
  a.tracking_code,
  a.status as affiliate_status,
  coalesce(clicks.total_clicks, 0) as total_clicks,
  coalesce(clicks.unique_clicks, 0) as unique_clicks,
  coalesce(conv.total_orders, 0) as total_orders,
  coalesce(conv.total_revenue_cents, 0) as total_revenue_cents,
  case when coalesce(clicks.total_clicks, 0) > 0
    then round(coalesce(conv.total_orders, 0)::numeric / clicks.total_clicks * 100, 2)
    else 0 end as conversion_rate_pct,
  coalesce(earn.total_earned_cents, 0) as total_earned_cents,
  coalesce(earn.held_cents, 0) as held_cents,
  coalesce(earn.payable_cents, 0) as payable_cents,
  coalesce(earn.paid_cents, 0) as paid_cents,
  now() as refreshed_at
from public.affiliates a
left join (
  select affiliate_id, count(*) as total_clicks, count(distinct fingerprint) as unique_clicks
  from public.affiliate_click_events group by affiliate_id
) clicks on clicks.affiliate_id = a.id
left join (
  select aa.affiliate_id, count(distinct o.id) as total_orders, sum(o.total_cents) as total_revenue_cents
  from public.affiliate_attributions aa join public.orders o on o.id = aa.order_id
  where o.payment_status = 'paid' group by aa.affiliate_id
) conv on conv.affiliate_id = a.id
left join (
  select affiliate_id,
    sum(amount_cents) as total_earned_cents,
    sum(case when status = 'held' then amount_cents else 0 end) as held_cents,
    sum(case when status = 'payable' then amount_cents else 0 end) as payable_cents,
    sum(case when status = 'paid' then amount_cents else 0 end) as paid_cents
  from public.commission_ledger where status in ('held', 'payable', 'paid') group by affiliate_id
) earn on earn.affiliate_id = a.id
with no data;

create unique index if not exists idx_mv_affiliate_perf_uniq on public.mv_affiliate_performance(affiliate_id);

create materialized view if not exists public.mv_product_performance as
select
  p.id as product_id,
  p.name as product_name,
  p.category,
  p.price_cents as current_price_cents,
  coalesce(sum(oi.quantity), 0) as total_units_sold,
  coalesce(sum(oi.line_total_cents), 0) as total_revenue_cents,
  coalesce(count(distinct o.id), 0) as order_count,
  now() as refreshed_at
from public.products p
left join public.order_items oi on oi.product_id = p.id
left join public.orders o on o.id = oi.order_id and o.payment_status = 'paid'
where p.active = true
group by p.id, p.name, p.category, p.price_cents
with no data;

create unique index if not exists idx_mv_product_perf_uniq on public.mv_product_performance(product_id);

create materialized view if not exists public.mv_commission_plan_effectiveness as
select
  cp.id as plan_id,
  cp.name as plan_name,
  cp.scope,
  cp.tiers_enabled,
  cp.tier_percentages,
  coalesce(aff.affiliate_count, 0) as affiliate_count,
  coalesce(led.total_commissions, 0) as total_commissions,
  coalesce(led.total_amount_cents, 0) as total_amount_cents,
  case when coalesce(led.total_commissions, 0) > 0
    then round(led.total_amount_cents::numeric / led.total_commissions, 0)
    else 0 end as avg_commission_cents,
  now() as refreshed_at
from public.commission_plans cp
left join (
  select commission_plan_id, count(*) as affiliate_count
  from public.affiliates where status = 'approved' group by commission_plan_id
) aff on aff.commission_plan_id = cp.id
left join (
  select (plan_snapshot_json->>'plan_id')::uuid as plan_id, count(*) as total_commissions, sum(amount_cents) as total_amount_cents
  from public.commission_ledger
  where plan_snapshot_json ? 'plan_id'
  group by (plan_snapshot_json->>'plan_id')::uuid
) led on led.plan_id = cp.id
with no data;

create unique index if not exists idx_mv_commission_plan_eff_uniq on public.mv_commission_plan_effectiveness(plan_id);

refresh materialized view public.mv_affiliate_performance;
refresh materialized view public.mv_product_performance;
refresh materialized view public.mv_commission_plan_effectiveness;

-- Seed data.
insert into public.commission_plans (name, tiers_enabled, tier_percentages, scope, is_default, launch_bonus_cents, global_bonus_pool_pct)
values ('Default', 5, '{20,10,5,3,2}', 'global', true, 10000, 3.00)
on conflict do nothing;

insert into public.store_settings (key, value, description) values
  ('commission_hold_days', '14', 'Days to hold commissions before release'),
  ('min_payout_cents', '5000', 'Minimum payout threshold in cents ($50)'),
  ('fraud_click_threshold', '100', 'Max clicks per affiliate per hour before flagging'),
  ('fraud_click_window_minutes', '60', 'Time window for click velocity check'),
  ('enrollment_pack_threshold_cents', '20000', 'Minimum order amount in cents to classify as ENROLLMENT_PACK ($200)')
on conflict (key) do nothing;

insert into public.rank_definitions (rank_code, rank_name, rank_order, min_active_customers, min_personal_volume_cents, min_team_volume_cents, unlocked_generations, customer_commission_pct) values
  ('active_affiliate', 'Active Affiliate', 1, 0, 0, 0, 0, 0.20),
  ('builder', 'Builder', 2, 5, 0, 0, 1, 0.25),
  ('leader', 'Leader', 3, 10, 0, 0, 2, 0.30),
  ('elite_leader', 'Elite Leader', 4, 15, 0, 0, 3, 0.35),
  ('icon', 'Icon', 5, 25, 0, 0, 5, 0.40),
  ('legend', 'Legend', 6, 25, 0, 0, 5, 0.40)
on conflict (rank_code) do nothing;

insert into public.commission_config_versions (
  effective_start_date, commissionable_rate,
  fast_start_enabled, fast_start_l1_pct, fast_start_l2_pct, fast_start_l3_pct, fast_start_compression_mode,
  generation_enabled, generation_g1_pct, generation_g2_pct, generation_g3_pct, generation_g4_pct, generation_g5_pct,
  generation_pool_cap_pct, generation_threshold_rank, generation_compression_mode,
  direct_bonus_enabled, direct_bonus_tier1_pct, direct_bonus_tier1_volume_cents,
  direct_bonus_tier2_pct, direct_bonus_tier2_volume_cents, direct_bonus_tier_mode, direct_bonus_volume_basis,
  customer_commission_enabled, customer_commission_compression_mode,
  personal_sub_enabled, personal_sub_pct, personal_sub_min_customers, max_total_payout_pct
) values (
  '2026-04-01', 0.30,
  true, 0.40, 0.20, 0.10, 'compress',
  true, 0.04, 0.04, 0.04, 0.04, 0.04,
  0.25, 'elite_leader', 'compress',
  true, 0.05, 500000, 0.10, 1000000, 'highest_only', 'personally_enrolled_volume',
  true, 'none', true, 0.12, 5, 1.00
)
on conflict do nothing;
