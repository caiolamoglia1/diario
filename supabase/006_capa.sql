-- ============================================================
--  Nosso Diário — capa escolhida (vale para os dois)
--  Rode no Supabase: SQL Editor > New query > cole > Run
-- ============================================================
alter table public.diary_settings add column if not exists cover text;
