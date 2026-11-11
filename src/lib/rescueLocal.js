import { supabase } from './supabase';
import { uploadAudio, uploadPhoto } from './photos';

// Resgate do "modo local": antes do Supabase estar ligado no site publicado, o app
// guardava tudo só no navegador (chave abaixo). Aqui encontramos o que a pessoa
// escreveu nesse período e enviamos para o banco de verdade.
const LOCAL_KEY = 'nosso-diario:dados';
const BACKUP_KEY = 'nosso-diario:dados-resgatados';
const LOCAL_ME = 'demo-1';

// dados de exemplo do modo local (não são da pessoa)
const SEED_IDS = new Set(['e1', 'e2', 'e3', 'n1', 'n2', 'n3', 'n4', 'n5', 'l1', 'l2', 'l3', 'w1', 'w2', 'w3', 'w4', 'c1', 'c2']);
const SEED_ANSWERS = new Set([
  'Aquele piquenique no parque, quando começou a chover e a gente ficou rindo embaixo da árvore.',
  'O cinema que a gente nem assistiu o filme direito de tanto conversar.',
  'Viajar para o sul e ver neve juntos ❄️'
]);

const mine = row => !SEED_IDS.has(row.id) && (row.author_id ?? row.user_id) === LOCAL_ME;

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY));
  } catch {
    return null;
  }
}

/** o que a pessoa escreveu no modo local, neste aparelho (ou null se não tiver nada) */
export function findLocalData() {
  const db = readLocal();
  if (!db?.entries) return null;
  const found = {
    entries: (db.entries ?? []).filter(mine),
    notes: (db.notes ?? []).filter(mine),
    letters: (db.letters ?? []).filter(mine),
    wishlist: (db.wishlist ?? []).filter(mine),
    countdowns: (db.countdowns ?? []).filter(mine),
    answers: (db.answers ?? []).filter(a => a.user_id === LOCAL_ME && !SEED_ANSWERS.has(a.answer)),
    files: db.files ?? {}
  };
  const total = found.entries.length + found.notes.length + found.letters.length + found.wishlist.length + found.countdowns.length + found.answers.length;
  return total > 0 ? { ...found, total } : null;
}

/** guarda uma cópia e tira os dados locais do caminho (não pergunta de novo) */
export function dismissLocalData() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) localStorage.setItem(BACKUP_KEY, raw);
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    // ignora
  }
}

async function fileFrom(files, path, upload, userId) {
  const dataUrl = path && files[path];
  if (!dataUrl) return null;
  const blob = await (await fetch(dataUrl)).blob();
  return upload(blob, userId);
}

/** envia tudo para o banco; devolve quantos itens foram e os erros (se houver) */
export async function importLocalData(found, userId) {
  const errors = [];
  let sent = 0;
  const run = async (label, fn) => {
    try {
      const { error } = await fn();
      if (error) errors.push(`${label}: ${error.message}`);
      else sent += 1;
    } catch (e) {
      errors.push(`${label}: ${e.message}`);
    }
  };

  for (const e of found.entries) {
    await run('página', async () => {
      const photo_path = await fileFrom(found.files, e.photo_path, uploadPhoto, userId);
      return supabase.from('entries').insert({
        entry_date: e.entry_date,
        mood: e.mood ?? null,
        title: e.title ?? null,
        content: e.content,
        ...(photo_path ? { photo_path } : {})
      });
    });
  }
  for (const n of found.notes) {
    await run('bilhete', async () => {
      const photo_path = await fileFrom(found.files, n.photo_path, uploadPhoto, userId);
      const audio_path = await fileFrom(found.files, n.audio_path, uploadAudio, userId);
      return supabase.from('notes').insert({
        note_date: n.note_date,
        style: n.style ?? 'envelope',
        content: n.content,
        ...(photo_path ? { photo_path } : {}),
        ...(audio_path ? { audio_path } : {})
      });
    });
  }
  for (const l of found.letters) {
    await run('carta', () => supabase.from('letters').insert({ prompt: l.prompt, content: l.content }));
  }
  for (const w of found.wishlist) {
    await run('item da lista', async () => {
      const photo_path = await fileFrom(found.files, w.photo_path, uploadPhoto, userId);
      return supabase.from('wishlist').insert({
        title: w.title,
        category: w.category ?? 'outro',
        ...(w.done_at ? { done_at: w.done_at, done_by: userId } : {}),
        ...(photo_path ? { photo_path } : {})
      });
    });
  }
  for (const c of found.countdowns) {
    await run('contagem', () => supabase.from('countdowns').insert({ title: c.title, emoji: c.emoji, target_date: c.target_date }));
  }
  for (const a of found.answers) {
    await run('resposta', () => supabase.from('answers').upsert({ question_date: a.question_date, user_id: userId, answer: a.answer }));
  }

  if (errors.length === 0) dismissLocalData();
  return { sent, errors };
}
