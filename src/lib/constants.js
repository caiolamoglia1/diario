export const MOODS = [
  { emoji: '🥰', label: 'apaixonado' },
  { emoji: '😊', label: 'feliz' },
  { emoji: '😌', label: 'tranquilo' },
  { emoji: '🥱', label: 'cansado' },
  { emoji: '🥺', label: 'saudade' },
  { emoji: '😢', label: 'triste' },
  { emoji: '😤', label: 'bravinho' },
  { emoji: '🤩', label: 'animado' }
];

export const REACTIONS = ['💗', '🥹', '😂', '🫂'];

export const AVATARS = ['🐻', '🐰', '🐱', '🐶', '🦊', '🐼', '🐸', '🐥', '🦄', '🐨'];

export const COLORS = ['#ff8fab', '#c8a2ff', '#7ec8ff', '#7ddbb1', '#ffb86b', '#ff9b85'];

export function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function todayISO() {
  const now = new Date();
  const off = now.getTimezoneOffset() * 60000;
  return new Date(now - off).toISOString().slice(0, 10);
}

// Citações de O Morro dos Ventos Uivantes (Emily Brontë)
export const QUOTES = [
  'Do que quer que sejam feitas nossas almas, a sua e a minha são iguais.',
  'Se tudo o mais perecesse e ele permanecesse, eu continuaria a existir; e, se tudo o mais permanecesse e ele fosse aniquilado, o universo se tornaria, para mim, uma imensa pessoa estranha.',
  'Ele é mais eu do que eu mesma.',
  'Eu não despedacei o seu coração... você o despedaçou; e, ao fazê-lo, despedaçou o meu.',
  'O meu amor por Linton é como a folhagem dos bosques: o tempo o transformará, como o inverno transforma as árvores. Mas o meu amor por Heathcliff se assemelha às rochas eternas que ficam debaixo do chão.'
];

// Estilos de cartinha para os bilhetes
export const NOTE_STYLES = [
  { id: 'envelope', label: 'envelope', icon: '✉️' },
  { id: 'postal', label: 'cartão-postal', icon: '📮' },
  { id: 'coracao', label: 'corações', icon: '💗' },
  { id: 'bilhete', label: 'bilhete', icon: '📝' }
];

export function shiftDate(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  const off = date.getTimezoneOffset() * 60000;
  return new Date(date - off).toISOString().slice(0, 10);
}

/** número pseudo-aleatório estável a partir de um texto (posição/rotação das cartinhas) */
export function seeded(text, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/** dias inteiros entre duas datas ISO (yyyy-mm-dd) */
export function daysBetween(fromIso, toIso) {
  const [a, b] = [fromIso, toIso].map(iso => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  });
  return Math.round((b - a) / 86400000);
}

/** é aniversário (mesmo dia e mês) ou mesversário (mesmo dia do mês) de `since` em `today`? */
export function specialDay(since, today) {
  if (!since) return null;
  const [sy, sm, sd] = since.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  if (today <= since) return null;
  const lastDay = new Date(ty, tm, 0).getDate();
  const dayMatches = td === Math.min(sd, lastDay);
  if (!dayMatches) return null;
  const months = (ty - sy) * 12 + (tm - sm);
  if (months % 12 === 0) return { kind: 'aniversario', years: months / 12 };
  return { kind: 'mesversario', months };
}

// ---------- Pergunta do dia (a mesma para os dois; muda todo dia) ----------
export const QUESTIONS = [
  'Qual foi o nosso melhor encontro até hoje?',
  'O que você quer fazer comigo este ano?',
  'Qual foi a primeira coisa que você reparou em mim?',
  'Qual música te lembra a gente?',
  'Que lugar do mundo você queria conhecer comigo?',
  'Qual é a sua lembrança favorita de nós dois?',
  'O que eu faço que te deixa feliz sem eu perceber?',
  'Qual foi o momento em que você soube que gostava de mim?',
  'Como seria o nosso domingo perfeito?',
  'Qual comida sempre vai te lembrar de mim?',
  'O que você mais admira em mim?',
  'Qual foi a coisa mais engraçada que já aconteceu com a gente?',
  'Que hábito meu você acha mais fofo?',
  'Se a gente tivesse um dia inteiro livre amanhã, o que faríamos?',
  'Qual filme ou série a gente precisa ver juntos?',
  'Qual foi o melhor presente que você já ganhou de mim?',
  'O que você gostaria que a gente fizesse mais vezes?',
  'Qual é o nosso “lugar”?',
  'Como você imagina a gente daqui a 5 anos?',
  'Qual foi o dia mais difícil que a gente passou junto e como superamos?',
  'Que apelido meu você mais gosta?',
  'O que você aprendeu comigo?',
  'Qual cheiro te lembra de mim?',
  'O que te faz sentir mais amado(a) por mim?',
  'Qual viagem a gente não pode deixar de fazer?',
  'Qual foi a última vez que eu te fiz rir muito?',
  'Se a nossa história fosse um livro, qual seria o título?',
  'Que pequena coisa eu poderia fazer amanhã para deixar seu dia melhor?',
  'Qual é o seu momento favorito do nosso dia a dia?',
  'Que receita a gente deveria tentar cozinhar juntos?',
  'O que você diria para mim no nosso primeiro encontro, se pudesse voltar no tempo?',
  'Qual foi a nossa maior aventura?',
  'Que mania nossa ninguém mais entenderia?',
  'Qual é a coisa mais romântica que eu já fiz?',
  'O que você sente quando a gente fica longe?',
  'Qual sonho seu você quer que eu te ajude a realizar?',
  'Qual foto nossa você mais gosta e por quê?',
  'Qual é a sua parte favorita do meu rosto?',
  'O que você quer que a gente nunca deixe de fazer?',
  'Que conselho você daria para nós dois de hoje?',
  'Qual foi a nossa melhor conversa?',
  'Que lugar da cidade é a nossa cara?',
  'Qual tradição a gente devia criar?',
  'Se a gente adotasse um bichinho, qual seria o nome?',
  'O que te deixa com saudade de mim mais rápido?',
  'Qual foi a última coisa que te fez lembrar de mim do nada?',
  'Que surpresa você adoraria receber?',
  'Qual é a nossa piada interna favorita?',
  'O que você gostaria de me dizer hoje e ainda não disse?',
  'Qual é a sua palavra favorita para descrever a gente?'
];

/** a pergunta do dia é a mesma para os dois (escolhida pela data) */
export function questionFor(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const day = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  return QUESTIONS[((day % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length];
}

// ---------- Cartas "abra quando…" ----------
export const LETTER_PROMPTS = [
  { prompt: 'estiver triste', emoji: '🌧️' },
  { prompt: 'sentir saudade', emoji: '🥺' },
  { prompt: 'não conseguir dormir', emoji: '🌙' },
  { prompt: 'precisar rir', emoji: '😂' },
  { prompt: 'estiver com raiva de mim', emoji: '😤' },
  { prompt: 'tiver um dia difícil', emoji: '🫂' },
  { prompt: 'quiser lembrar do nosso começo', emoji: '💞' },
  { prompt: 'estiver feliz', emoji: '🌻' }
];

export const promptEmoji = prompt => LETTER_PROMPTS.find(p => p.prompt === prompt)?.emoji ?? '✉️';

// ---------- Nossa lista ----------
export const WISH_CATEGORIES = [
  { id: 'lugar', label: 'lugar', emoji: '📍' },
  { id: 'viagem', label: 'viagem', emoji: '✈️' },
  { id: 'filme', label: 'filme/série', emoji: '🎬' },
  { id: 'comida', label: 'comida', emoji: '🍝' },
  { id: 'experiencia', label: 'experiência', emoji: '🎡' },
  { id: 'outro', label: 'outro', emoji: '✨' }
];

export const wishEmoji = id => WISH_CATEGORIES.find(c => c.id === id)?.emoji ?? '✨';

export const COUNTDOWN_EMOJIS = ['✈️', '💞', '🎂', '🎄', '🏖️', '🎟️', '🍽️', '🏠', '💍', '✨'];
