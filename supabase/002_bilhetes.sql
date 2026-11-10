-- ============================================================
--  Nosso Diário — bilhetinhos do dia
--  Rode no Supabase: SQL Editor > New query > cole tudo > Run
--  (pode rodar mais de uma vez sem problema)
-- ============================================================

create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  note_date  date not null default current_date,
  content    text not null check (char_length(content) between 1 and 500),
  style      text not null default 'envelope' check (style in ('envelope', 'postal', 'coracao', 'bilhete')),
  created_at timestamptz not null default now()
);
create index if not exists notes_date_idx on public.notes (note_date, created_at);

alter table public.notes enable row level security;

drop policy if exists "notes_select" on public.notes;
drop policy if exists "notes_insert" on public.notes;
drop policy if exists "notes_update" on public.notes;
drop policy if exists "notes_delete" on public.notes;
create policy "notes_select" on public.notes for select to authenticated
  using (public.is_member());
create policy "notes_insert" on public.notes for insert to authenticated
  with check (author_id = auth.uid() and public.is_member());
create policy "notes_update" on public.notes for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "notes_delete" on public.notes for delete to authenticated
  using (author_id = auth.uid());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notes'
  ) then
    alter publication supabase_realtime add table public.notes;
  end if;
end $$;
