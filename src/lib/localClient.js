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
    ]
  };
}

function loadDb() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.profiles && saved?.entries && saved?.reactions) return saved;
  } catch {
    // sem localStorage (aba anônima bloqueada etc.): segue só em memória
  }
  return seed();
}

function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // ignora: os dados continuam em memória nesta aba
  }
}

export function createLocalClient() {
  const db = loadDb();
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

  function query(table) {
    let op = 'select';
    let payload = null;
    let withReactions = false;
    let one = false;
    const filters = [];
    const orders = [];

    const run = () => {
      const match = row => filters.every(([k, v]) => row[k] === v);
      if (op === 'insert') {
        const row = { id: uid(), author_id: ME, user_id: ME, created_at: new Date().toISOString(), ...payload };
        if (table === 'reactions') delete row.id;
        if (table !== 'entries') delete row.author_id;
        if (table !== 'reactions') delete row.user_id;
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
      let rows = db[table].filter(match).map(row =>
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

  return {
    from: query,
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
