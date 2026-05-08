-- XO Pure CRM sync bookkeeping for idempotent Supabase <-> Twenty mapping.
-- Keep service-role access server-side only. If this table remains in `public`,
-- RLS is enabled as defense in depth and no broad client policies are created.

create table if not exists public.crm_sync_map (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  source_schema text not null default 'public',
  source_table text not null,
  source_id text not null,
  twenty_object text not null,
  twenty_record_id text,
  sync_direction text not null default 'supabase_to_twenty',
  content_hash text,
  last_payload jsonb,
  last_written_by text,
  last_synced_at timestamptz,
  last_error text,
  retry_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_sync_map_source_unique unique (source_system, source_schema, source_table, source_id),
  constraint crm_sync_map_twenty_unique unique (twenty_object, twenty_record_id),
  constraint crm_sync_map_direction_check check (
    sync_direction in ('supabase_to_twenty', 'twenty_to_supabase', 'bidirectional')
  )
);

create index if not exists crm_sync_map_source_lookup_idx
  on public.crm_sync_map (source_system, source_schema, source_table, source_id);

create index if not exists crm_sync_map_twenty_lookup_idx
  on public.crm_sync_map (twenty_object, twenty_record_id);

create index if not exists crm_sync_map_last_synced_at_idx
  on public.crm_sync_map (last_synced_at);

alter table public.crm_sync_map enable row level security;

create or replace function public.set_crm_sync_map_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_crm_sync_map_updated_at on public.crm_sync_map;
create trigger set_crm_sync_map_updated_at
  before update on public.crm_sync_map
  for each row
  execute function public.set_crm_sync_map_updated_at();
