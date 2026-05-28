create table if not exists public.drawings (
  id text primary key,
  snapshot jsonb,
  updated_at timestamptz not null default now()
);

alter table public.drawings enable row level security;

create policy "No browser access to drawings"
on public.drawings
for all
using (false)
with check (false);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tldraw-assets',
  'tldraw-assets',
  false,
  20971520,
  array['image/gif', 'image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
on conflict (id) do nothing;
