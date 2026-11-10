// Edge Function "push": recebe o aviso do banco (webhook) quando alguém escreve
// e manda notificação para os aparelhos do OUTRO, mesmo com o app fechado.
//
// Segredos necessários (Supabase > Edge Functions > Secrets):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, WEBHOOK_SECRET
// (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem automaticamente)
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:nosso-diario@example.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

const preview = (text?: string | null) => (text && text.length > 90 ? `${text.slice(0, 90)}…` : text ?? '');

function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }); // yyyy-mm-dd
}

function message(table: string, row: Record<string, any>, name: string) {
  switch (table) {
    case 'entries':
      return { title: `📖 ${name} escreveu no diário`, body: preview(row.title || row.content), tag: 'entry' };
    case 'notes':
      return row.note_date > today()
        ? { title: `💌 ${name} deixou um bilhete lacrado`, body: `🔒 só pode ser aberto em ${row.note_date.split('-').reverse().join('/')}`, tag: 'note' }
        : { title: `💌 ${name} deixou um bilhetinho`, body: preview(row.content), tag: 'note' };
    case 'reactions':
      return { title: `${row.emoji} ${name} reagiu a uma página sua`, body: '', tag: 'reaction' };
    case 'letters':
      return { title: `✉️ ${name} guardou uma carta para você`, body: `abra quando ${row.prompt}`, tag: 'letter' };
    case 'answers':
      return { title: `❓ ${name} respondeu a pergunta do dia`, body: 'responda também para ver a resposta 💭', tag: 'answer' };
    case 'wishlist':
      return { title: `📝 ${name} adicionou à nossa lista`, body: preview(row.title), tag: 'wish' };
    case 'countdowns':
      return { title: `⏳ ${name} criou uma contagem regressiva`, body: `${row.emoji} ${row.title}`, tag: 'countdown' };
    default:
      return null;
  }
}

Deno.serve(async req => {
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('não autorizado', { status: 401 });
  }

  const { type, table, record } = await req.json();
  if (type !== 'INSERT' || !record) return new Response('ignorado');

  const authorId = record.author_id ?? record.user_id;
  const { data: author } = await supabase.from('profiles').select('name').eq('id', authorId).maybeSingle();
  const msg = message(table, record, author?.name ?? 'Seu amor');
  if (!msg) return new Response('ignorado');

  // só os aparelhos de quem NÃO escreveu
  const { data: subs } = await supabase.from('push_subscriptions').select('*').neq('user_id', authorId);

  const results = await Promise.allSettled(
    (subs ?? []).map(async sub => {
      try {
        await webpush.sendNotification(sub.subscription, JSON.stringify(msg), { TTL: 60 * 60 * 24 });
      } catch (error) {
        // aparelho desinstalou / trocou: remove a inscrição
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
        throw error;
      }
    })
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  return new Response(JSON.stringify({ sent, total: results.length }), { headers: { 'Content-Type': 'application/json' } });
});
