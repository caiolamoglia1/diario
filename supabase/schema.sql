-- ============================================================
--  Nosso Diário — schema do Supabase
--  Cole tudo isto em: Supabase > SQL Editor > New query > Run
-- ============================================================

-- Perfis: no máximo 2 pessoas
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  emoji      text not null default '🐻',
  color      text not null default '#ff8fab',
  created_at timestamptz not null default now()
);

-- Páginas do diário
create table if not exists public.entries (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title      text check (char_length(title) <= 120),
  content    text not null check (char_length(content) between 1 and 20000),
  mood       text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists entries_date_idx on public.entries (entry_date desc, created_at desc);

-- Reações (corações, etc.) nas páginas
create table if not exists public.reactions (
  entry_id   uuid not null references public.entries(id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id, emoji)
);

-- ------------------------------------------------------------
--  Só 2 membros: um terceiro usuário até consegue logar,
--  mas não consegue criar perfil e portanto não vê nada.
-- ------------------------------------------------------------
create or replace function public.enforce_two_members()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.profiles) >= 2 then
    raise exception 'Este diário já tem duas pessoas 💕';
  end if;
  return new;
end $$;

drop trigger if exists two_members_only on public.profiles;
create trigger two_members_only
  before insert on public.profiles
  for each row execute function public.enforce_two_members();

create or replace function public.is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

-- ------------------------------------------------------------
--  Row Level Security
-- ------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.entries   enable row level security;
alter table public.reactions enable row level security;

drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_member());
create policy "profiles_insert" on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "profiles_update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "entries_select" on public.entries;
drop policy if exists "entries_insert" on public.entries;
drop policy if exists "entries_update" on public.entries;
drop policy if exists "entries_delete" on public.entries;
create policy "entries_select" on public.entries for select to authenticated
  using (public.is_member());
create policy "entries_insert" on public.entries for insert to authenticated
  with check (author_id = auth.uid() and public.is_member());
create policy "entries_update" on public.entries for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "entries_delete" on public.entries for delete to authenticated
  using (author_id = auth.uid());

drop policy if exists "reactions_select" on public.reactions;
drop policy if exists "reactions_insert" on public.reactions;
drop policy if exists "reactions_delete" on public.reactions;
create policy "reactions_select" on public.reactions for select to authenticated
  using (public.is_member());
create policy "reactions_insert" on public.reactions for insert to authenticated
  with check (user_id = auth.uid() and public.is_member());
create policy "reactions_delete" on public.reactions for delete to authenticated
  using (user_id = auth.uid());

-- ------------------------------------------------------------
--  Tempo real: o que um escreve aparece na hora para o outro
-- ------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profiles', 'entries', 'reactions'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
