import { useSyncExternalStore } from 'react';
import { subscribePush, unsubscribePush } from './push';

// Avisos quando o outro escreve: notificação do sistema (se permitida) + aviso dentro do app.
const KEY = 'nosso-diario:avisos';

export const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window;

function readEnabled() {
  try {
    return localStorage.getItem(KEY) === 'on' && notificationsSupported && Notification.permission === 'granted';
  } catch {
    return false;
  }
}

let enabled = readEnabled();

export const readNotificationsEnabled = () => enabled;
let toasts = [];
const listeners = new Set();
const emit = () => listeners.forEach(fn => fn());
const subscribe = fn => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** pede permissão (precisa vir de um clique) e liga/desliga os avisos */
export async function toggleNotifications() {
  if (!notificationsSupported) return false;
  if (enabled) {
    enabled = false;
    unsubscribePush().catch(() => {});
  } else {
    const permission = await Notification.requestPermission();
    enabled = permission === 'granted';
    // com o push configurado, os avisos chegam mesmo com o app fechado
    if (enabled) subscribePush().catch(() => {});
  }
  try {
    localStorage.setItem(KEY, enabled ? 'on' : 'off');
  } catch {
    // ignora
  }
  emit();
  return enabled;
}

export function useNotificationsEnabled() {
  return useSyncExternalStore(subscribe, () => enabled);
}

export function useToasts() {
  return useSyncExternalStore(subscribe, () => toasts);
}

export function dismissToast(id) {
  toasts = toasts.filter(t => t.id !== id);
  emit();
}

/** mostra o aviso dentro do app e, se a aba não estiver visível, também no sistema */
export async function notify(title, body, tag) {
  const id = `${Date.now()}-${Math.random()}`;
  toasts = [...toasts.slice(-2), { id, title, body }];
  emit();
  setTimeout(() => dismissToast(id), 6000);

  if (!enabled || document.visibilityState === 'visible') return;
  try {
    // pelo service worker funciona melhor no celular (app instalado)
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, { body, tag, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' });
    else new Notification(title, { body, tag, icon: '/icons/icon-192.png' });
  } catch {
    // sem permissão ou navegador sem suporte: fica só o aviso dentro do app
  }
}
