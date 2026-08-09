alter table public.case_attachments add column updated_at timestamptz not null default now();
