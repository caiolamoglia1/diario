import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';
import { formatDate, todayISO } from './constants';
import { setPolaroidPhoto } from './photos';
import { notify, readNotificationsEnabled } from './notify';
import { subscribePush } from './push';

// tabela/função ainda não criada no Supabase (falta rodar algum SQL)
const isMissing = error => Boolean(error && ['PGRST205', 'PGRST202', '42P01', '42883'].includes(error.code));

const EMPTY = {
  profiles: [],
  entries: [],
  notes: [],
  letters: [],
  closedLetters: [],
  answers: [],
  answeredBy: [],
  wishlist: [],
  countdowns: [],
  settings: { together_since: null },
  missing: { notes: false, settings: false, cantinhos: false }
};

const asc = key => (a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0);

/** tudo o que o diário lê do banco + tempo real + avisos */
export default function useDiaryData(me) {
  const [data, setData] = useState(() => ({ ...EMPTY, profiles: [me] }));

  const load = useCallback(async () => {
    const [p, e, n, st, sealed, l, lc, a, ab, w, c] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('entries').select('*, reactions(*)').order('entry_date', { ascending: true }).order('created_at', { ascending: true }),
      supabase.from('notes').select('*').order('note_date', { ascending: true }).order('created_at', { ascending: true }),
      supabase.from('diary_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.rpc('sealed_notes'),
      supabase.from('letters').select('*').order('created_at', { ascending: true }),
      supabase.rpc('letters_closed'),
      supabase.from('answers').select('*').order('question_date', { ascending: true }),
      supabase.rpc('answered_by'),
      supabase.from('wishlist').select('*').order('created_at', { ascending: true }),
      supabase.from('countdowns').select('*').order('target_date', { ascending: true })
    ]);
    // bilhetes lacrados do outro chegam sem texto (o banco não entrega antes do dia)
    const sealedNotes = (sealed.data ?? []).map(s => ({ ...s, content: '', sealed: true }));
    const visibleNotes = (n.data ?? []).filter(x => !sealedNotes.some(s => s.id === x.id));
    setData(prev => ({
      profiles: p.error ? prev.profiles : p.data,
      entries: e.error ? prev.entries : e.data,
      notes: n.error ? prev.notes : [...visibleNotes, ...sealedNotes].sort(asc('created_at')).sort(asc('note_date')),
      letters: l.data ?? [],
      closedLetters: lc.data ?? [],
      answers: a.data ?? [],
      answeredBy: ab.data ?? [],
      wishlist: w.data ?? [],
      countdowns: c.data ?? [],
      settings: { together_since: st.data?.together_since ?? null },
      missing: {
        notes: isMissing(n.error),
        settings: Boolean(st.error),
        cantinhos: isMissing(l.error) || isMissing(w.error) || isMissing(a.error)
      }
    }));
    return e.data ?? [];
  }, []);

  // nomes atualizados para os avisos (o canal de tempo real é criado uma vez só)
  const profilesRef = useRef(data.profiles);
  useEffect(() => {
    profilesRef.current = data.profiles;
  }, [data.profiles]);

  const reloadTimer = useRef(0);
  useEffect(() => {
    load();
    const channel = supabase
      .channel('diario')
      .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
        clearTimeout(reloadTimer.current);
        reloadTimer.current = setTimeout(load, 250);
        announce(payload, me.id, profilesRef.current);
      })
      .subscribe();
    // voltou para o app: recarrega (bilhete que destravou à meia-noite, carta nova…)
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    // avisos já ligados antes: garante que este aparelho está inscrito no push
    if (readNotificationsEnabled()) subscribePush().catch(() => {});
    return () => {
      clearTimeout(reloadTimer.current);
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load, me.id]);

  // polaroid da mesa: a foto mais recente de vocês
  useEffect(() => {
    const photos = [...data.entries, ...data.notes, ...data.wishlist]
      .filter(x => x.photo_path)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    setPolaroidPhoto(photos[0]?.photo_path ?? null);
  }, [data.entries, data.notes, data.wishlist]);

  const saveTogetherSince = useCallback(
    async date => {
      const { error } = await supabase
        .from('diary_settings')
        .upsert({ id: 1, together_since: date, updated_at: new Date().toISOString() });
      if (error) window.alert(error.message);
      load();
    },
    [load]
  );

  return { ...data, load, saveTogetherSince };
}

const preview = text => (text && text.length > 90 ? `${text.slice(0, 90)}…` : text);

/** transforma um evento do tempo real em aviso (só o que o OUTRO fez) */
function announce(payload, myId, profiles) {
  if (payload?.eventType !== 'INSERT' || !payload.new) return;
  const row = payload.new;
  const who = row.author_id ?? row.user_id;
  if (!who || who === myId) return;
  const name = profiles.find(p => p.id === who)?.name ?? 'Seu amor';
  const messages = {
    entries: () => [`📖 ${name} escreveu no diário`, preview(row.title || row.content), 'entry'],
    notes: () =>
      row.note_date > todayISO()
        ? [`💌 ${name} deixou um bilhete lacrado`, `🔒 só abre em ${formatDate(row.note_date)}`, 'note']
        : [`💌 ${name} deixou um bilhetinho`, preview(row.content), 'note'],
    reactions: () => [`${row.emoji} ${name} reagiu a uma página sua`, '', 'reaction'],
    answers: () => [`❓ ${name} respondeu a pergunta do dia`, 'responda também para ver 💭', 'answer'],
    wishlist: () => [`📝 ${name} adicionou à nossa lista`, preview(row.title), 'wish'],
    countdowns: () => [`⏳ ${name} criou uma contagem regressiva`, `${row.emoji} ${row.title}`, 'countdown']
  };
  const build = messages[payload.table];
  if (build) notify(...build());
}
