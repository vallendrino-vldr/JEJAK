alter table public.case_attachments
  add column if not exists updated_at timestamptz not null default now();
