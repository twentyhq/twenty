-- =============================================================================
-- XO Pure CRM read-only source views for Supabase-to-Twenty sync (X0-22).
-- These views define the sanitized projection boundary and are the ONLY
-- objects the crm_readonly role can access — no direct public.* or auth.*
-- grants are issued to this role.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Ensure the crm schema exists (already created by 202605190001, idempotent)
-- ---------------------------------------------------------------------------

create schema if not exists crm;

-- ---------------------------------------------------------------------------
-- 2. Read-only source views — sanitized projections of application data
-- ---------------------------------------------------------------------------

-- products view — sourced from public.products
create or replace view crm.v_twenty_products as
select
  id,
  name,
  sku,
  slug,
  price_cents,
  currency,
  category,
  pre_order,
  featured,
  active,
  stock_quantity,
  cv_amount,
  product_url,
  created_at,
  updated_at
from public.products;

comment on view crm.v_twenty_products is
  'Read-only projection for CRM sync. Columns consumed by mapProduct(). Accessible by crm_readonly.';

-- order_items view — sourced from public.order_items
create or replace view crm.v_twenty_order_items as
select
  id,
  order_id,
  product_id,
  name,
  sku,
  quantity,
  unit_price_cents,
  line_total_cents,
  cv_amount,
  category,
  created_at,
  updated_at
from public.order_items;

comment on view crm.v_twenty_order_items is
  'Read-only projection for CRM sync. Columns consumed by mapOrderItem(). Accessible by crm_readonly.';

-- customer_expertise view — sourced from public.customer_expertise with safe projections
-- Fields that do not exist in the source table (email, lifetime_value_cents, order_count,
-- last_order_at) are hard-coded as null/zero to prevent accidental data exposure.
create or replace view crm.v_twenty_customer_expertise as
select
  id,
  customer_id,
  customer_id::text as name,
  null::text as email,
  0::integer as lifetime_value_cents,
  0::integer as order_count,
  null::timestamptz as last_order_at,
  created_at,
  updated_at
from public.customer_expertise;

comment on view crm.v_twenty_customer_expertise is
  'Read-only projection for CRM sync. Only id and customer_id are projected from source; all other fields are null/zero defaults.';

-- payments view — sourced from public.orders billing columns only (sanitized).
--   Does NOT project the raw gateway_payload jsonb field or any unprocessed
--   gateway data — only summary-level payment fields visible to admin UI.
create or replace view crm.v_twenty_payments as
select
  id,
  id as order_id,
  payment_gateway as provider,
  null::text as rail,
  payment_gateway as method_code,
  coalesce(total_cents, subtotal_cents, 0) as amount_cents,
  currency,
  payment_status as status,
  null::text as provider_payment_id,
  refund_amount_cents,
  null::text as description,
  created_at,
  updated_at
from public.orders;

comment on view crm.v_twenty_payments is
  'Sanitized payment projection for CRM sync. Sourced from public.orders billing columns only — no raw gateway payload is exposed.';

-- ---------------------------------------------------------------------------
-- 3. crm_readonly role — no embedded password; connection auth handled
--    externally via pg_hba.conf or Supabase project settings.
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select from pg_catalog.pg_roles where rolname = 'crm_readonly') then
    create role crm_readonly login noinherit;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 4. Schema usage grant
-- ---------------------------------------------------------------------------

grant usage on schema crm to crm_readonly;

-- ---------------------------------------------------------------------------
-- 5. Per-view SELECT grants for all eight crm.v_twenty_* views
--    (views 1-4 created in 202605190001, views 5-8 defined above).
-- ---------------------------------------------------------------------------

grant select on crm.v_twenty_ambassadors to crm_readonly;
grant select on crm.v_twenty_people to crm_readonly;
grant select on crm.v_twenty_orders to crm_readonly;
grant select on crm.v_twenty_commissions to crm_readonly;
grant select on crm.v_twenty_products to crm_readonly;
grant select on crm.v_twenty_order_items to crm_readonly;
grant select on crm.v_twenty_customer_expertise to crm_readonly;
grant select on crm.v_twenty_payments to crm_readonly;
