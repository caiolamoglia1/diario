import { useSyncExternalStore } from 'react';

// Tema visual do diário: 'cozy' (aconchego) ou 'moor' (Morro dos Ventos Uivantes).
// É uma preferência de quem está vendo, então fica salvo no navegador.
const KEY = 'nosso-diario:tema';
export const THEMES = ['cozy', 'moor'];

function read() {
  try {
    const saved = localStorage.getItem(KEY);
    return THEMES.includes(saved) ? saved : 'cozy';
  } catch {
    return 'cozy';
  }
}

let current = read();
const listeners = new Set();

function apply(theme) {
  document.documentElement.dataset.theme = theme;
}
apply(current);

function commit(theme) {
  current = theme;
  apply(theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // sem localStorage: vale só até recarregar
  }
  listeners.forEach(fn => fn());
}

/** Troca o tema passando uma névoa pela tela (a troca acontece com a tela coberta). */
export function setTheme(theme) {
  if (theme === current || !THEMES.includes(theme)) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    commit(theme);
    return;
  }
  const veil = document.createElement('div');
  veil.className = `theme-veil to-${theme}`;
  document.body.appendChild(veil);
  setTimeout(() => commit(theme), 650);
  setTimeout(() => veil.remove(), 1500);
}

export function useTheme() {
  return useSyncExternalStore(
    fn => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => current
  );
}
