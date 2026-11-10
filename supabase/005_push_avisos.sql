-- ============================================================
--  Nosso Diário — avisos com o app fechado (push)
--  Rode DEPOIS de criar a Edge Function "push" (veja o README).
--  Use a cópia supabase/005_push_avisos.local.sql, que já vem com o seu segredo
--  preenchido (ela fica fora do git). Este arquivo é só o modelo.
-- ============================================================

create extension if not exists pg_net with schema extensions;

-- guarda o segredo do webhook no Vault (criptografado), não no código
do $$
begin
  if exists (select 1 from vault.secrets where name = 'push_webhook_secret') then
    perform vault.update_secret(
      (select id from vault.secrets where name = 'push_webhook_secret'),
      'COLE_AQUI_O_WEBHOOK_SECRET'
    );
  else
    perform vault.create_secret('COLE_AQUI_O_WEBHOOK_SECRET', 'push_webhook_secret');
  end if;
end $$;

-- chama a função "push" a cada coisa nova escrita
create or replace function public.notify_push()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare
  secret text;
begin
  select decrypted_secret into secret from vault.decrypted_secrets where name = 'push_webhook_secret';
  perform net.http_post(
    url     := 'https://wwaozoyvpsqbdpcrfwpk.supabase.co/functions/v1/push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', secret),
    body    := jsonb_build_object('type', TG_OP, 'table', TG_TABLE_NAME, 'record', to_jsonb(NEW))
  );
  return NEW;
end $$;

do $$
declare t text;
begin
  foreach t in array array['entries', 'notes', 'reactions', 'letters', 'answers', 'wishlist', 'countdowns'] loop
    execute format('drop trigger if exists push_on_insert on public.%I', t);
    execute format(
      'create trigger push_on_insert after insert on public.%I for each row execute function public.notify_push()', t
    );
  end loop;
end $$;
