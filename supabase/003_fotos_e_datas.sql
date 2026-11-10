-- ============================================================
--  Nosso Diário — fotos e datas especiais
--  Rode no Supabase: SQL Editor > New query > cole tudo > Run
--  (precisa do schema.sql e do 002_bilhetes.sql antes; pode rodar mais de uma vez)
-- ============================================================

-- Fotos nas páginas e nos bilhetes (caminho do arquivo no Storage)
alter table public.entries add column if not exists photo_path text;
alter table public.notes   add column if not exists photo_path text;

-- Configurações do casal (uma linha só): data em que começaram a namorar
create table if not exists public.diary_settings (
  id             int primary key default 1 check (id = 1),
  together_since date,
  updated_at     timestamptz not null default now()
);

alter table public.diary_settings enable row level security;

drop policy if exists "settings_select" on public.diary_settings;
drop policy if exists "settings_insert" on public.diary_settings;
drop policy if exists "settings_update" on public.diary_settings;
create policy "settings_select" on public.diary_settings for select to authenticated
  using (public.is_member());
create policy "settings_insert" on public.diary_settings for insert to authenticated
  with check (public.is_member());
create policy "settings_update" on public.diary_settings for update to authenticated
  using (public.is_member()) with check (public.is_member());

-- Pasta PRIVADA de fotos: só vocês dois conseguem ver/enviar
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', false)
on conflict (id) do nothing;

drop policy if exists "fotos_select" on storage.objects;
drop policy if exists "fotos_insert" on storage.objects;
drop policy if exists "fotos_delete" on storage.objects;
create policy "fotos_select" on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and public.is_member());
create policy "fotos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and public.is_member());
create policy "fotos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and public.is_member());

-- Tempo real para a data do casal
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'diary_settings'
  ) then
    alter publication supabase_realtime add table public.diary_settings;
  end if;
end $$;
