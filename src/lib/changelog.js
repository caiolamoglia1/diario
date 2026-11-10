// Aba "atualizações": o que foi chegando no diário. A primeira é a mais nova.
export const CHANGELOG = [
  {
    version: '1.4',
    date: '2026-11-10',
    title: 'cantinhos da mesa',
    items: [
      '🗝️ uma gaveta na mesa com os novos cantinhos',
      '✉️ cartas “abra quando…”: o texto só aparece quando a carta é aberta',
      '❓ pergunta do dia: a resposta do outro aparece depois que você responde',
      '📝 nossa lista de coisas para fazer juntos, com foto quando realizarem',
      '⏳ contagens regressivas aparecendo em cima da mesa',
      '📊 retrospectiva do mês e do ano, com “nesse dia, um ano atrás…”',
      '🔍 busca em páginas, bilhetes, cartas e respostas',
      '🎙️ recadinho de voz nos bilhetes',
      '🔒 bilhetes lacrados agora são protegidos pelo próprio banco',
      '🔔 avisos mesmo com o app fechado (no celular, com o app instalado)'
    ]
  },
  {
    version: '1.3',
    date: '2026-11-09',
    title: 'fotos, calendário e datas especiais',
    items: [
      '📷 fotos nas páginas e nos bilhetes; a polaroid da mesa mostra a mais recente',
      '📅 calendário com os dias que têm páginas e bilhetes',
      '💞 contador “juntos há X dias” e festa no aniversário e mesversário',
      '🔒 bilhetes com data futura chegam lacrados',
      '📱 dá para instalar o diário como app no celular',
      '🔔 avisos quando o outro escreve'
    ]
  },
  {
    version: '1.2',
    date: '2026-11-09',
    title: 'bilhetinhos',
    items: [
      '💌 bilhetinhos do dia espalhados pela mesa em cartinhas',
      '✦ citações de O Morro dos Ventos Uivantes'
    ]
  },
  {
    version: '1.1',
    date: '2026-11-08',
    title: 'Morro dos Ventos Uivantes',
    items: ['🌫️ novo clima do diário: névoa, vela preta e rosas secas', '✋ virar a página arrastando']
  },
  {
    version: '1.0',
    date: '2026-11-06',
    title: 'o começo',
    items: ['📔 nosso diário na mesa de madeira, folheando páginas de verdade']
  }
];

export const LATEST_VERSION = CHANGELOG[0].version;

const SEEN_KEY = 'nosso-diario:novidades-vistas';

export function hasUnseenUpdates() {
  try {
    return localStorage.getItem(SEEN_KEY) !== LATEST_VERSION;
  } catch {
    return false;
  }
}

export function markUpdatesSeen() {
  try {
    localStorage.setItem(SEEN_KEY, LATEST_VERSION);
  } catch {
    // ignora
  }
}
