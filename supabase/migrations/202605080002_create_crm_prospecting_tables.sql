-- XO Pure CRM prospecting and sync event tables.
-- These tables intentionally separate non-customer prospecting records from
-- customer, ambassador, order, and commission records in the affiliate schema.

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create table if not exists public.retail_prospects (
  id uuid primary key default gen_random_uuid(),
  email text,
  name text,
  phone text,
  company text,
  website text,
  source text not null default 'manual',
  stage text not null default 'new',
  status text not null default 'open',
  lead_score integer not null default 0,
  tags text[] not null default '{}',
  social_handles jsonb not null default '{}',
  enrichment_status text not null default 'pending',
  enrichment_data jsonb not null default '{}',
  sequence_key text,
  sequence_state jsonb not null default '{}',
  last_contacted_at timestamptz,
  assigned_to uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint retail_prospects_stage_check check (stage in ('new', 'researching', 'qualified', 'sequencing', 'contacted', 'converted', 'disqualified')),
  constraint retail_prospects_status_check check (status in ('open', 'paused', 'won', 'lost')),
  constraint retail_prospects_score_check check (lead_score >= 0 and lead_score <= 100)
);

create unique index if not exists retail_prospects_email_unique_idx
  on public.retail_prospects (lower(email)) where email is not null;

create index if not exists retail_prospects_stage_idx on public.retail_prospects (stage);
create index if not exists retail_prospects_status_idx on public.retail_prospects (status);
create index if not exists retail_prospects_enrichment_status_idx on public.retail_prospects (enrichment_status);
create index if not exists retail_prospects_tags_idx on public.retail_prospects using gin (tags);
create index if not exists retail_prospects_enrichment_data_idx on public.retail_prospects using gin (enrichment_data);

alter table public.retail_prospects enable row level security;

drop policy if exists "Admin full access to retail prospects" on public.retail_prospects;
create policy "Admin full access to retail prospects" on public.retail_prospects
  for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

create table if not exists public.influencer_prospects (
  id uuid primary key default gen_random_uuid(),
  email text,
  name text,
  phone text,
  platform text,
  handle text,
  profile_url text,
  niche text,
  follower_count integer,
  engagement_rate numeric(8,5),
  media_kit_url text,
  source text not null default 'manual',
  stage text not null default 'new',
  status text not null default 'open',
  lead_score integer not null default 0,
  tags text[] not null default '{}',
  social_handles jsonb not null default '{}',
  enrichment_status text not null default 'pending',
  enrichment_data jsonb not null default '{}',
  sequence_key text,
  sequence_state jsonb not null default '{}',
  last_contacted_at timestamptz,
  assigned_to uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint influencer_prospects_stage_check check (stage in ('new', 'researching', 'qualified', 'sequencing', 'contacted', 'converted', 'disqualified')),
  constraint influencer_prospects_status_check check (status in ('open', 'paused', 'won', 'lost')),
  constraint influencer_prospects_score_check check (lead_score >= 0 and lead_score <= 100),
  constraint influencer_prospects_follower_count_check check (follower_count is null or follower_count >= 0)
);

create unique index if not exists influencer_prospects_email_unique_idx
  on public.influencer_prospects (lower(email)) where email is not null;

create unique index if not exists influencer_prospects_platform_handle_unique_idx
  on public.influencer_prospects (lower(platform), lower(handle)) where platform is not null and handle is not null;

create index if not exists influencer_prospects_stage_idx on public.influencer_prospects (stage);
create index if not exists influencer_prospects_status_idx on public.influencer_prospects (status);
create index if not exists influencer_prospects_platform_idx on public.influencer_prospects (platform);
create index if not exists influencer_prospects_enrichment_status_idx on public.influencer_prospects (enrichment_status);
create index if not exists influencer_prospects_tags_idx on public.influencer_prospects using gin (tags);
create index if not exists influencer_prospects_enrichment_data_idx on public.influencer_prospects using gin (enrichment_data);

alter table public.influencer_prospects enable row level security;

drop policy if exists "Admin full access to influencer prospects" on public.influencer_prospects;
create policy "Admin full access to influencer prospects" on public.influencer_prospects
  for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

create table if not exists public.crm_sync_events (
  id uuid primary key default gen_random_uuid(),
  source_system text not null default 'supabase',
  source_schema text not null default 'public',
  source_table text not null,
  source_id text,
  operation text not null default 'UPSERT',
  target_object text,
  target_record_id text,
  payload jsonb not null default '{}',
  status text not null default 'queued',
  error_message text,
  attempts integer not null default 0,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_sync_events_status_check check (status in ('queued', 'processing', 'processed', 'failed', 'ignored')),
  constraint crm_sync_events_operation_check check (operation in ('INSERT', 'UPDATE', 'DELETE', 'UPSERT'))
);

create index if not exists crm_sync_events_source_idx
  on public.crm_sync_events (source_system, source_schema, source_table, source_id);

create index if not exists crm_sync_events_status_idx on public.crm_sync_events (status, created_at);
create index if not exists crm_sync_events_target_idx on public.crm_sync_events (target_object, target_record_id);

alter table public.crm_sync_events enable row level security;

drop policy if exists "Admin full access to CRM sync events" on public.crm_sync_events;
create policy "Admin full access to CRM sync events" on public.crm_sync_events
  for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

drop trigger if exists update_retail_prospects_updated_at on public.retail_prospects;
create trigger update_retail_prospects_updated_at
  before update on public.retail_prospects
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_influencer_prospects_updated_at on public.influencer_prospects;
create trigger update_influencer_prospects_updated_at
  before update on public.influencer_prospects
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_crm_sync_events_updated_at on public.crm_sync_events;
create trigger update_crm_sync_events_updated_at
  before update on public.crm_sync_events
  for each row execute function public.update_updated_at_column();
