-- =============================================================================
-- XO Pure CRM schema, audit trail, activity log, sanitized views, and sync queue.
-- Creates: crm schema, twenty_sync_audit, twenty_activity_log, stub views,
--          and enqueue_twenty_sync() function.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. CRM schema
-- ---------------------------------------------------------------------------

create schema if not exists crm;

-- ---------------------------------------------------------------------------
-- 2. crm.twenty_sync_audit — audit trail for all sync operations
-- ---------------------------------------------------------------------------

create table if not exists crm.twenty_sync_audit (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null default gen_random_uuid(),
  source_system text not null,
  source_schema text not null default 'public',
  source_table text not null,
  source_record_id text,
  target_object text not null,
  target_record_id text,
  operation text not null,
  status text not null,
  error_message text,
  duration_ms integer,
  payload_hash text,
  created_at timestamptz not null default now(),
  constraint twenty_sync_audit_operation_check
    check (operation in ('INSERT', 'UPDATE', 'DELETE', 'UPSERT')),
  constraint twenty_sync_audit_status_check
    check (status in ('success', 'failed', 'skipped', 'pending'))
);

create index if not exists twenty_sync_audit_run_id_idx
  on crm.twenty_sync_audit (run_id);

create index if not exists twenty_sync_audit_source_lookup_idx
  on crm.twenty_sync_audit (source_system, source_schema, source_table, source_record_id);

create index if not exists twenty_sync_audit_target_lookup_idx
  on crm.twenty_sync_audit (target_object, target_record_id);

create index if not exists twenty_sync_audit_status_created_idx
  on crm.twenty_sync_audit (status, created_at);

alter table crm.twenty_sync_audit enable row level security;

-- ---------------------------------------------------------------------------
-- 3. crm.twenty_activity_log — write-back tracking (Phase 2)
-- ---------------------------------------------------------------------------

create or replace function crm.set_twenty_activity_log_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists crm.twenty_activity_log (
  id uuid primary key default gen_random_uuid(),
  activity_type text not null,
  source text not null default 'twenty',
  target_table text,
  target_record_id text,
  payload jsonb not null default '{}',
  status text not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint twenty_activity_log_type_check
    check (activity_type in ('note', 'task_status', 'stage_update', 'owner_assignment')),
  constraint twenty_activity_log_status_check
    check (status in ('pending', 'sent', 'confirmed', 'failed'))
);

create index if not exists twenty_activity_log_status_idx
  on crm.twenty_activity_log (status, created_at);

create index if not exists twenty_activity_log_target_lookup_idx
  on crm.twenty_activity_log (target_table, target_record_id);

create index if not exists twenty_activity_log_activity_type_idx
  on crm.twenty_activity_log (activity_type);

alter table crm.twenty_activity_log enable row level security;

drop trigger if exists set_twenty_activity_log_updated_at on crm.twenty_activity_log;
create trigger set_twenty_activity_log_updated_at
  before update on crm.twenty_activity_log
  for each row
  execute function crm.set_twenty_activity_log_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Stub views — sanitized payload layer
--
--    These views project only the columns consumed by the TypeScript mapper
--    (map-supabase-record.ts) and act as the sanitization boundary between
--    raw application tables and the CRM sync pipeline.
--
--    TODO: After the full schema export from production, review each view to
--    ensure column lists are complete and add any new columns the mapper needs.
-- ---------------------------------------------------------------------------

-- ambassadors view — sourced from public.affiliates (confirmed in 202605080001)
-- Columns selected: all fields accessed by mapAmbassador() in map-supabase-record.ts
create or replace view crm.v_twenty_ambassadors as
select
  id,
  user_id,
  email,
  name,
  tracking_code,
  parent_id,
  status,
  rank,
  career_rank,
  paid_as_rank,
  active_customer_count,
  personal_volume_cents,
  team_volume_cents,
  reason,
  phone,
  commission_rate,
  show_peptides_link,
  held_commission_cents,
  payable_commission_cents,
  paid_commission_cents,
  lifetime_commission_cents,
  total_commission_earned_cents,
  last_commission_at,
  created_at,
  updated_at
from public.affiliates;

comment on view crm.v_twenty_ambassadors is
  'Sanitization boundary for CRM sync. Projects only columns consumed by mapAmbassador(). Update after full production schema export.';

-- people view — sourced from public.profiles (NOT in migrations, may not exist yet)
-- Columns selected: fields accessed by mapProfile() in map-supabase-record.ts
do $$ begin
  create or replace view crm.v_twenty_people as
  select
    id,
    first_name,
    last_name,
    email,
    phone,
    created_at,
    updated_at
  from public.profiles;

  comment on view crm.v_twenty_people is
    'Sanitization boundary for CRM sync. Projects only columns consumed by mapProfile(). Update after full production schema export.';
exception when undefined_table then
  raise notice 'public.profiles does not exist yet — crm.v_twenty_people skipped. Create after profiles table is provisioned.';
end $$;

-- orders view — sourced from public.orders (confirmed in 202605080001)
-- Columns selected: all fields accessed by mapOrder() and mapOrderRelations()
create or replace view crm.v_twenty_orders as
select
  id,
  user_email,
  customer_id,
  subtotal_cents,
  discount_amount_cents,
  shipping_cents,
  tax_cents,
  total_cents,
  refund_amount_cents,
  currency,
  affiliate_chain,
  payment_status,
  fulfillment_status,
  cv_amount,
  buyer_type,
  commerce_order_id,
  payment_method_code,
  manual_review_required,
  tracking_number,
  tracking_url,
  shipped_at,
  delivered_at,
  created_at,
  updated_at
from public.orders;

comment on view crm.v_twenty_orders is
  'Sanitization boundary for CRM sync. Projects only columns consumed by mapOrder(). Update after full production schema export.';

-- commissions view — sourced from public.commission_ledger (confirmed in 202605080001)
-- Columns selected: all fields accessed by mapCommission() and mapCommissionRelations()
create or replace view crm.v_twenty_commissions as
select
  id,
  order_id,
  affiliate_id,
  level,
  percentage_bps,
  amount_cents,
  status,
  hold_until,
  paid_at,
  pay_area,
  rate_used,
  base_cv_amount,
  source_order_id,
  source_affiliate_id,
  period_id,
  payable_at,
  created_at,
  updated_at
from public.commission_ledger;

comment on view crm.v_twenty_commissions is
  'Sanitization boundary for CRM sync. Projects only columns consumed by mapCommission(). Update after full production schema export.';

-- ---------------------------------------------------------------------------
-- 5. crm.enqueue_twenty_sync() — insert a pending audit row as sync event queue
-- ---------------------------------------------------------------------------

create or replace function crm.enqueue_twenty_sync(
  p_source_table text,
  p_operation text,
  p_source_record_id text default null,
  p_target_object text default null,
  p_source_system text default 'supabase',
  p_source_schema text default 'public',
  p_payload_hash text default null
)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into crm.twenty_sync_audit (
    source_system,
    source_schema,
    source_table,
    source_record_id,
    target_object,
    operation,
    status,
    payload_hash
  ) values (
    p_source_system,
    p_source_schema,
    p_source_table,
    p_source_record_id,
    p_target_object,
    upper(p_operation),
    'pending',
    p_payload_hash
  )
  returning id into new_id;

  return new_id;
end;
$$;

comment on function crm.enqueue_twenty_sync is
  'Enqueue a sync event by inserting a pending row into crm.twenty_sync_audit. Returns the new audit row id.';
