// Cliente local que imita a parte do Supabase que o app usa.
// Os dados ficam salvos no navegador (localStorage), então só existem neste computador/navegador.
// Quando o Supabase for configurado (.env.local), este arquivo deixa de ser usado.

const STORAGE_KEY = 'nosso-diario:dados';

const ME = 'demo-1';
const PARTNER = 'demo-2';

const daysAgo = n => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
};

const uid = () => Math.random().toString(36).slice(2, 10);

function seed() {
  const now = Date.now();
  return {
    profiles: [
      { id: ME, name: 'Mozão', emoji: '🐻', color: '#ff8fab', created_at: new Date(now - 9e8).toISOString() },
      { id: PARTNER, name: 'Mozinha', emoji: '🐰', color: '#c8a2ff', created_at: new Date(now - 8e8).toISOString() }
    ],
    entries: [
      {
        id: 'e1',
        author_id: PARTNER,
        title: 'O primeiro dia do nosso diário',
        content:
          'Hoje a gente decidiu começar este diário juntos. Quero guardar aqui as coisinhas pequenas: o café que você faz de manhã, as risadas sem motivo, os dias difíceis também.\n\nPrometo escrever sempre que der saudade. 💕',
        mood: '🥰',
        entry_date: daysAgo(6),
        created_at: new Date(now - 6 * 864e5).toISOString()
      },
      {
        id: 'e2',
        author_id: ME,
        title: 'Domingo de chuva',
        content:
          'Passamos a tarde inteira embaixo da coberta vendo filme. Você dormiu no meio do segundo e eu fiquei olhando a chuva na janela.\n\nMelhor domingo.',
        mood: '😌',
        entry_date: daysAgo(3),
        created_at: new Date(now - 3 * 864e5).toISOString()
      },
      {
        id: 'e3',
        author_id: PARTNER,
        title: null,
        content: 'Dia corrido no trabalho, mas chegar em casa e ver o bilhetinho na geladeira salvou tudo. Obrigada por existir 🥺',
        mood: '🥱',
        entry_date: daysAgo(1),
        created_at: new Date(now - 864e5).toISOString()
      }
    ],
    reactions: [
      { entry_id: 'e1', user_id: ME, emoji: '💗' },
      { entry_id: 'e2', user_id: PARTNER, emoji: '🥹' },
      { entry_id: 'e2', user_id: PARTNER, emoji: '💗' }
    ],
    notes: seedNotes(),
    diary_settings: [{ id: 1, together_since: daysAgo(400) }],
    files: {},
    ...seedCantinhos()
  };
}

function seedCantinhos() {
  const now = Date.now();
  const iso = ms => new Date(ms).toISOString();
  return {
    letters: [
      { id: 'l1', author_id: PARTNER, prompt: 'estiver triste', content: 'Lembra que você é a pessoa mais forte que eu conheço. E que eu tô aqui, sempre. Vem me dar um abraço 🫂', opened_at: null, created_at: iso(now - 5e8) },
      { id: 'l2', author_id: PARTNER, prompt: 'sentir saudade', content: 'Fecha os olhos e lembra do nosso domingo de chuva. Logo logo a gente tá junto de novo 💕', opened_at: iso(now - 2e8), created_at: iso(now - 6e8) },
      { id: 'l3', author_id: ME, prompt: 'não conseguir dormir', content: 'Conta as estrelas que eu conto as suas sardas. Boa noite, meu amor 🌙', opened_at: null, created_at: iso(now - 3e8) }
    ],
    answers: [
      { question_date: daysAgo(1), user_id: PARTNER, answer: 'Aquele piquenique no parque, quando começou a chover e a gente ficou rindo embaixo da árvore.', created_at: iso(now - 9e7) },
      { question_date: daysAgo(1), user_id: ME, answer: 'O cinema que a gente nem assistiu o filme direito de tanto conversar.', created_at: iso(now - 8e7) },
      { question_date: daysAgo(0), user_id: PARTNER, answer: 'Viajar para o sul e ver neve juntos ❄️', created_at: iso(now - 4e6) }
    ],
    wishlist: [
      { id: 'w1', author_id: PARTNER, title: 'Ver o pôr do sol no Arpoador', category: 'lugar', done_at: null, done_by: null, photo_path: null, created_at: iso(now - 7e8) },
      { id: 'w2', author_id: ME, title: 'Maratonar a trilogia do Senhor dos Anéis', category: 'filme', done_at: iso(now - 1e8), done_by: PARTNER, photo_path: null, created_at: iso(now - 8e8) },
      { id: 'w3', author_id: ME, title: 'Viagem para Gramado', category: 'viagem', done_at: null, done_by: null, photo_path: null, created_at: iso(now - 4e8) },
      { id: 'w4', author_id: PARTNER, title: 'Fazer lasanha caseira juntos', category: 'comida', done_at: null, done_by: null, photo_path: null, created_at: iso(now - 2e8) }
    ],
    countdowns: [
      { id: 'c1', author_id: PARTNER, title: 'viagem para Gramado', emoji: '✈️', target_date: daysAgo(-12), created_at: iso(now - 3e8) },
      { id: 'c2', author_id: ME, title: 'nosso aniversário de namoro', emoji: '💞', target_date: daysAgo(-40), created_at: iso(now - 2e8) }
    ]
  };
}

function seedNotes() {
  const now = Date.now();
  return [
    { id: 'n1', author_id: PARTNER, note_date: daysAgo(0), style: 'envelope', content: 'Bom dia, amor! Deixei café pronto pra você ☕💕', created_at: new Date(now - 5e6).toISOString() },
    { id: 'n2', author_id: ME, note_date: daysAgo(0), style: 'coracao', content: 'Você fica linda quando tá concentrada lendo.', created_at: new Date(now - 4e6).toISOString() },
    { id: 'n3', author_id: PARTNER, note_date: daysAgo(0), style: 'postal', content: 'Lembrete: hoje é noite de pizza e filme 🍕🎬', created_at: new Date(now - 3e6).toISOString() },
    { id: 'n4', author_id: ME, note_date: daysAgo(0), style: 'bilhete', content: 'Volto às 19h. Te amo mais que ontem e menos que amanhã.', created_at: new Date(now - 2e6).toISOString() },
    { id: 'n5', author_id: PARTNER, note_date: daysAgo(1), style: 'envelope', content: 'Obrigada pelo abraço de ontem. Precisava muito.', created_at: new Date(now - 9e7).toISOString() }
  ];
}

function loadDb() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.profiles && saved?.entries && saved?.reactions) {
      if (!saved.notes) saved.notes = seedNotes(); // dados salvos antes dos bilhetes existirem
      saved.diary_settings ??= [];
      saved.files ??= {};
      if (!saved.letters) Object.assign(saved, seedCantinhos());
      return saved;
    }
  } catch {
    // sem localStorage (aba anônima bloqueada etc.): segue só em memória
  }
  return seed();
}

function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch {
    // sem espaço / sem localStorage: os dados continuam em memória nesta aba
    return false;
  }
}

const toDataUrl = blob =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export function createLocalClient() {
  const db = loadDb();
  saveDb(db); // guarda os exemplos já no primeiro acesso
  const listeners = new Set();
  const authListeners = new Set();
  let session = { user: { id: ME, email: 'local@diario' } };

  const emit = () => {
    saveDb(db);
    setTimeout(() => listeners.forEach(fn => fn({})), 0);
  };

  // outra aba aberta escreveu algo: recarrega e avisa a tela (simula o tempo real)
  window.addEventListener('storage', e => {
    if (e.key !== STORAGE_KEY) return;
    Object.assign(db, loadDb());
    listeners.forEach(fn => fn({}));
  });
  const emitAuth = () => authListeners.forEach(fn => fn('SIGNED_IN', session));

  const today = () => daysAgo(0);

  // mesmas regras do banco (RLS): o que o outro escondeu não chega aqui
  function visible(table, row) {
    if (table === 'notes') return row.author_id === ME || row.note_date <= today();
    if (table === 'letters') return row.author_id === ME || Boolean(row.opened_at);
    if (table === 'answers') {
      return row.user_id === ME || db.answers.some(a => a.question_date === row.question_date && a.user_id === ME);
    }
    return true;
  }

  async function rpc(name, args = {}) {
    await new Promise(r => setTimeout(r, 80));
    if (name === 'sealed_notes') {
      const data = db.notes
        .filter(n => n.author_id !== ME && n.note_date > today())
        .map(({ id, author_id, note_date, style, created_at }) => ({ id, author_id, note_date, style, created_at }));
      return { data, error: null };
    }
    if (name === 'letters_closed') {
      const data = db.letters
        .filter(l => l.author_id !== ME && !l.opened_at)
        .map(({ id, author_id, prompt, created_at }) => ({ id, author_id, prompt, created_at }));
      return { data, error: null };
    }
    if (name === 'open_letter') {
      const letter = db.letters.find(l => l.id === args.p_id);
      if (letter && letter.author_id !== ME && !letter.opened_at) letter.opened_at = new Date().toISOString();
      emit();
      return { data: letter ? [{ ...letter }] : [], error: null };
    }
    if (name === 'answered_by') {
      return { data: db.answers.map(({ question_date, user_id }) => ({ question_date, user_id })), error: null };
    }
    return { data: null, error: { message: `função ${name} não existe no modo local` } };
  }

  function query(table) {
    let op = 'select';
    let payload = null;
    let withReactions = false;
    let one = false;
    const filters = [];
    const orders = [];

    const run = () => {
      db[table] ??= [];
      const match = row => filters.every(([k, v]) => row[k] === v);
      if (op === 'upsert') {
        const sameKey = r =>
          table === 'answers' ? r.question_date === payload.question_date && r.user_id === ME : r.id === payload.id;
        if (table === 'answers') payload.user_id = ME;
        const existing = db[table].find(sameKey);
        if (existing) Object.assign(existing, payload);
        else db[table].push({ ...payload });
        emit();
        return { data: null, error: null };
      }
      if (op === 'insert') {
        const row = { id: uid(), author_id: ME, user_id: ME, created_at: new Date().toISOString(), ...payload };
        const AUTHORED = ['entries', 'notes', 'letters', 'wishlist', 'countdowns'];
        const BY_USER = ['reactions', 'answers'];
        if (BY_USER.includes(table)) delete row.id;
        if (!AUTHORED.includes(table)) delete row.author_id;
        if (!BY_USER.includes(table)) delete row.user_id;
        db[table].push(row);
        emit();
        return { data: one ? row : [row], error: null };
      }
      if (op === 'update') {
        db[table].filter(match).forEach(row => Object.assign(row, payload));
        emit();
        return { data: null, error: null };
      }
      if (op === 'delete') {
        const removed = db[table].filter(match).map(r => r.id);
        db[table] = db[table].filter(row => !match(row));
        if (table === 'entries') db.reactions = db.reactions.filter(r => !removed.includes(r.entry_id));
        emit();
        return { data: null, error: null };
      }
      let rows = db[table].filter(match).filter(row => visible(table, row)).map(row =>
        withReactions ? { ...row, reactions: db.reactions.filter(r => r.entry_id === row.id) } : { ...row }
      );
      for (const [key, asc] of [...orders].reverse()) {
        rows = [...rows].sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * (asc ? 1 : -1));
      }
      return { data: one ? (rows[0] ?? null) : rows, error: null };
    };

    const api = {
      select(cols = '*') {
        if (op === 'select') withReactions = cols.includes('reactions(');
        return api;
      },
      insert(values) {
        op = 'insert';
        payload = values;
        return api;
      },
      upsert(values) {
        op = 'upsert';
        payload = values;
        return api;
      },
      update(values) {
        op = 'update';
        payload = values;
        return api;
      },
      delete() {
        op = 'delete';
        return api;
      },
      eq(key, value) {
        filters.push([key, value]);
        return api;
      },
      match(obj) {
        Object.entries(obj).forEach(pair => filters.push(pair));
        return api;
      },
      order(key, { ascending = true } = {}) {
        orders.push([key, ascending]);
        return api;
      },
      single() {
        one = true;
        return api;
      },
      maybeSingle() {
        one = true;
        return api;
      },
      then(resolve, reject) {
        return new Promise(r => setTimeout(r, 120)).then(run).then(resolve, reject);
      }
    };
    return api;
  }

  // Storage local: as fotos viram data URLs guardadas junto com os dados
  const storage = {
    from() {
      return {
        async upload(path, blob) {
          db.files[path] = await toDataUrl(blob);
          if (!saveDb(db)) {
            delete db.files[path];
            return { data: null, error: { message: 'Sem espaço no navegador para mais fotos (modo local). Configure o Supabase para guardar fotos à vontade.' } };
          }
          emit();
          return { data: { path }, error: null };
        },
        async createSignedUrls(paths) {
          return { data: paths.map(path => ({ path, signedUrl: db.files[path] ?? null })), error: null };
        },
        async remove(paths) {
          paths.forEach(path => delete db.files[path]);
          emit();
          return { data: null, error: null };
        }
      };
    }
  };

  return {
    from: query,
    rpc,
    storage,
    auth: {
      getSession: async () => ({ data: { session } }),
      onAuthStateChange(fn) {
        authListeners.add(fn);
        return { data: { subscription: { unsubscribe: () => authListeners.delete(fn) } } };
      },
      async signInWithPassword() {
        session = { user: { id: ME, email: 'local@diario' } };
        emitAuth();
        return { error: null };
      },
      async signOut() {
        session = null;
        authListeners.forEach(fn => fn('SIGNED_OUT', null));
        return { error: null };
      }
    },
    channel() {
      let handler = null;
      const ch = {
        on(_type, _filter, fn) {
          handler = fn;
          return ch;
        },
        subscribe() {
          if (handler) listeners.add(handler);
          return ch;
        },
        _off() {
          if (handler) listeners.delete(handler);
        }
      };
      return ch;
    },
    removeChannel(ch) {
      ch._off();
    }
  };
}
