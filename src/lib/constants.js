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
