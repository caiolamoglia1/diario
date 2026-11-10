import { useSyncExternalStore } from 'react';

// Capas do diário. A escolha é dos dois: fica no banco (diary_settings.cover)
// e também no aparelho, para abrir já com a capa certa.
export const COVERS = [
  { id: 'classico', name: 'Couro clássico', desc: 'couro vinho, cantoneiras douradas e fecho de couro' },
  { id: 'linho', name: 'Linho bordado', desc: 'linho verde-sálvia com guirlanda bordada e laço de fita' },
  { id: 'estrelado', name: 'Céu estrelado', desc: 'azul-noite, constelações, lua dourada e elástico' },
  { id: 'aquarela', name: 'Aquarela', desc: 'papel com aquarela pastel, flores prensadas e washi tape' },
  { id: 'vintage', name: 'Carta vintage', desc: 'kraft com barbante, selos postais e lacre de cera' }
];

const KEY = 'nosso-diario:capa';
const valid = id => COVERS.some(c => c.id === id);

function read() {
  try {
    const saved = localStorage.getItem(KEY);
    return valid(saved) ? saved : 'classico';
  } catch {
    return 'classico';
  }
}

let current = read();
const listeners = new Set();

export function setCover(id) {
  if (!valid(id) || id === current) return;
  current = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // sem localStorage: vale só até recarregar
  }
  listeners.forEach(fn => fn());
}

export function useCover() {
  return useSyncExternalStore(
    fn => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => current
  );
}
