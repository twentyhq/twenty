-- =============================================================================
-- Add support ticket projection to the CRM read-only Supabase sync surface.
--
-- This keeps the DSN reader on the crm.v_twenty_* sanitization boundary while
-- exposing only the fields consumed by mapSupportTicket().
-- =============================================================================

do $$
begin
  create or replace view crm.v_twenty_support_tickets as
  select
    id,
    ticket_number,
    status,
    priority,
    category,
    channel,
    subject,
    body,
    requester_email,
    requester_name,
    requester_phone,
    related_order_id,
    related_product_id,
    message_count,
    first_response_at,
    resolved_at,
    closed_at,
    last_activity_at,
    created_at,
    updated_at
  from public.support_tickets;

  comment on view crm.v_twenty_support_tickets is
    'Read-only projection for CRM support ticket sync. Projects only columns consumed by mapSupportTicket().';

  grant select on crm.v_twenty_support_tickets to crm_readonly;
exception when undefined_table or undefined_object then
  raise notice 'public.support_tickets or crm_readonly does not exist yet — crm.v_twenty_support_tickets skipped.';
end $$;
