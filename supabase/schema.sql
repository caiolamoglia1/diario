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

-- ------------------------------------------------------------
--  Bilhetinhos (também disponível separado em 002_bilhetes.sql)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
--  Fotos e datas especiais (também separado em 003_fotos_e_datas.sql)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
--  Cantinhos (também separado em 004_cantinhos.sql)
-- ------------------------------------------------------------
-- "hoje" no fuso de vocês (o banco roda em UTC)
create or replace function public.local_today()
returns date language sql stable as $$
  select (now() at time zone 'America/Sao_Paulo')::date;
$$;

-- ------------------------------------------------------------
--  Lacre seguro: bilhete com data futura do outro NÃO é entregue
--  (só aparece o envelope, sem texto/foto/áudio, até o dia chegar)
-- ------------------------------------------------------------
alter table public.notes add column if not exists audio_path text;

drop policy if exists "notes_select" on public.notes;
create policy "notes_select" on public.notes for select to authenticated
  using (public.is_member() and (author_id = auth.uid() or note_date <= public.local_today()));

create or replace function public.sealed_notes()
returns table (id uuid, author_id uuid, note_date date, style text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select n.id, n.author_id, n.note_date, n.style, n.created_at
  from public.notes n
  where public.is_member() and n.author_id <> auth.uid() and n.note_date > public.local_today();
$$;

-- ------------------------------------------------------------
--  Cartas "abra quando…": o texto só chega depois de abrir
-- ------------------------------------------------------------
create table if not exists public.letters (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  prompt     text not null check (char_length(prompt) between 1 and 80),
  content    text not null check (char_length(content) between 1 and 5000),
  opened_at  timestamptz,
  created_at timestamptz not null default now()
);
alter table public.letters enable row level security;

drop policy if exists "letters_select" on public.letters;
drop policy if exists "letters_insert" on public.letters;
drop policy if exists "letters_delete" on public.letters;
create policy "letters_select" on public.letters for select to authenticated
  using (public.is_member() and (author_id = auth.uid() or opened_at is not null));
create policy "letters_insert" on public.letters for insert to authenticated
  with check (author_id = auth.uid() and public.is_member());
create policy "letters_delete" on public.letters for delete to authenticated
  using (author_id = auth.uid());

-- cartas fechadas que o outro deixou para mim (sem o texto)
create or replace function public.letters_closed()
returns table (id uuid, author_id uuid, prompt text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select l.id, l.author_id, l.prompt, l.created_at
  from public.letters l
  where public.is_member() and l.author_id <> auth.uid() and l.opened_at is null;
$$;

-- abrir uma carta (só quem recebeu) e receber o texto
create or replace function public.open_letter(p_id uuid)
returns setof public.letters
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_member() then
    return;
  end if;
  update public.letters set opened_at = now()
  where id = p_id and author_id <> auth.uid() and opened_at is null;
  return query select * from public.letters where id = p_id;
end $$;

-- ------------------------------------------------------------
--  Pergunta do dia: a resposta do outro só aparece depois que você responder
-- ------------------------------------------------------------
create table if not exists public.answers (
  question_date date not null,
  user_id       uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  answer        text not null check (char_length(answer) between 1 and 2000),
  created_at    timestamptz not null default now(),
  primary key (question_date, user_id)
);
alter table public.answers enable row level security;

create or replace function public.has_answered(p_date date)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.answers where question_date = p_date and user_id = auth.uid());
$$;

drop policy if exists "answers_select" on public.answers;
drop policy if exists "answers_insert" on public.answers;
drop policy if exists "answers_update" on public.answers;
drop policy if exists "answers_delete" on public.answers;
create policy "answers_select" on public.answers for select to authenticated
  using (public.is_member() and (user_id = auth.uid() or public.has_answered(question_date)));
create policy "answers_insert" on public.answers for insert to authenticated
  with check (user_id = auth.uid() and public.is_member());
create policy "answers_update" on public.answers for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "answers_delete" on public.answers for delete to authenticated
  using (user_id = auth.uid());

-- quem já respondeu cada dia (sem revelar a resposta), para mostrar "fulano já respondeu"
create or replace function public.answered_by()
returns table (question_date date, user_id uuid)
language sql stable security definer set search_path = public as $$
  select a.question_date, a.user_id from public.answers a where public.is_member();
$$;

-- ------------------------------------------------------------
--  Nossa lista (coisas para fazer juntos)
-- ------------------------------------------------------------
create table if not exists public.wishlist (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 200),
  category   text not null default 'outro',
  done_at    timestamptz,
  done_by    uuid references public.profiles(id) on delete set null,
  photo_path text,
  created_at timestamptz not null default now()
);
alter table public.wishlist enable row level security;

drop policy if exists "wishlist_select" on public.wishlist;
drop policy if exists "wishlist_insert" on public.wishlist;
drop policy if exists "wishlist_update" on public.wishlist;
drop policy if exists "wishlist_delete" on public.wishlist;
create policy "wishlist_select" on public.wishlist for select to authenticated using (public.is_member());
create policy "wishlist_insert" on public.wishlist for insert to authenticated
  with check (author_id = auth.uid() and public.is_member());
create policy "wishlist_update" on public.wishlist for update to authenticated
  using (public.is_member()) with check (public.is_member());
create policy "wishlist_delete" on public.wishlist for delete to authenticated using (public.is_member());

-- ------------------------------------------------------------
--  Contagens regressivas
-- ------------------------------------------------------------
create table if not exists public.countdowns (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 80),
  emoji       text not null default '✨',
  target_date date not null,
  created_at  timestamptz not null default now()
);
alter table public.countdowns enable row level security;

drop policy if exists "countdowns_select" on public.countdowns;
drop policy if exists "countdowns_insert" on public.countdowns;
drop policy if exists "countdowns_delete" on public.countdowns;
create policy "countdowns_select" on public.countdowns for select to authenticated using (public.is_member());
create policy "countdowns_insert" on public.countdowns for insert to authenticated
  with check (author_id = auth.uid() and public.is_member());
create policy "countdowns_delete" on public.countdowns for delete to authenticated using (public.is_member());

-- ------------------------------------------------------------
--  Avisos com o app fechado: onde entregar o push de cada aparelho
-- ------------------------------------------------------------
create table if not exists public.push_subscriptions (
  endpoint     text primary key,
  user_id      uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  subscription jsonb not null,
  created_at   timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;

drop policy if exists "push_own" on public.push_subscriptions;
create policy "push_own" on public.push_subscriptions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_member());

-- ------------------------------------------------------------
--  Tempo real
-- ------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['letters', 'answers', 'wishlist', 'countdowns'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
