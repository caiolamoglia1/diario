import { supabase, usingSupabase } from './supabase';

// Push "de verdade" (chega mesmo com o app fechado). Precisa de:
// Supabase configurado + VITE_VAPID_PUBLIC_KEY + service worker (só no site publicado).
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const pushAvailable =
  usingSupabase && Boolean(VAPID_PUBLIC_KEY) && 'serviceWorker' in navigator && 'PushManager' in window;

function keyToBytes(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

/** inscreve este aparelho para receber avisos; devolve true se deu certo */
export async function subscribePush() {
  if (!pushAvailable) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false; // no `npm run dev` não há service worker
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(VAPID_PUBLIC_KEY) });
  }
  const json = sub.toJSON();
  const { error } = await supabase.from('push_subscriptions').upsert({ endpoint: json.endpoint, subscription: json });
  return !error;
}

export async function unsubscribePush() {
  if (!pushAvailable) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
  await sub.unsubscribe();
}
