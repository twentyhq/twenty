-- =============================================================================
-- Align CRM read-only projections with the current Supabase-to-Twenty mapper.
--
-- The worker now reads from crm.v_twenty_* views. These views must expose only
-- columns that exist in the raw source schema, with explicit NULL placeholders
-- for intentionally unsupported fields.
-- =============================================================================

create or replace view crm.v_twenty_products as
select
  id,
  name,
  sku,
  null::text as slug,
  price_cents,
  currency,
  category,
  null::boolean as pre_order,
  null::boolean as featured,
  active,
  null::integer as stock_quantity,
  cv_amount_cents as cv_amount,
  null::text as product_url,
  created_at,
  updated_at
from public.products;

comment on view crm.v_twenty_products is
  'Read-only projection for CRM sync. Projects existing product columns and explicit NULLs for unsupported fields consumed defensively by mapProduct().';

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
  null::integer as cv_amount,
  category,
  created_at,
  updated_at
from public.order_items;

comment on view crm.v_twenty_order_items is
  'Read-only projection for CRM sync. Order-line CV is not present in public.order_items and is exposed as NULL until derived.';

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
  null::integer as refund_amount_cents,
  null::text as description,
  created_at,
  updated_at
from public.orders;

comment on view crm.v_twenty_payments is
  'Sanitized payment projection for CRM sync. Refunds are not projected from public.orders; no raw gateway payload is exposed.';

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
  order_id as source_order_id,
  source_affiliate_id,
  period_id,
  release_at,
  created_at,
  updated_at
from public.commission_ledger;

comment on view crm.v_twenty_commissions is
  'Read-only projection for CRM sync. release_at feeds mapCommission().payableAt; source_order_id is normalized from order_id.';
