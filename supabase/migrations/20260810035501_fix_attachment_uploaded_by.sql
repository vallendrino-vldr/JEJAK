alter table public.case_attachments alter column uploaded_by drop not null;
alter table public.case_attachments drop constraint case_attachments_uploaded_by_fkey;
alter table public.case_attachments add constraint case_attachments_uploaded_by_fkey foreign key (uploaded_by) references auth.users (id) on delete set null;
