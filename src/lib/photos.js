import { useEffect, useState, useSyncExternalStore } from 'react';
import { supabase } from './supabase';

const BUCKET = 'fotos';
const URL_TTL = 60 * 60; // links temporários de 1 hora (a pasta é privada)

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** reduz a foto (lado maior até `max` px) e converte para JPEG antes de enviar */
export async function compressImage(file, max = 1600, quality = 0.82) {
  let source;
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    source = await loadImage(file);
  }
  const scale = Math.min(1, max / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('não deu para ler essa foto'))), 'image/jpeg', quality)
  );
}

/** envia a foto e devolve o caminho dela no Storage */
export async function uploadPhoto(file, userId) {
  const blob = await compressImage(file);
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
  if (error) throw new Error(error.message);
  return path;
}

/** envia um recadinho de voz e devolve o caminho no Storage */
export async function uploadAudio(blob, userId) {
  const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
  const path = `${userId}/audio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || 'audio/webm' });
  if (error) throw new Error(error.message);
  return path;
}

export async function removePhoto(path) {
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

// cache dos links temporários, para não pedir de novo a cada render
const urlCache = new Map();

async function signedUrl(path) {
  const hit = urlCache.get(path);
  if (hit && hit.expires > Date.now()) return hit.url;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls([path], URL_TTL);
  const url = data?.[0]?.signedUrl ?? null;
  if (url) urlCache.set(path, { url, expires: Date.now() + (URL_TTL - 60) * 1000 });
  return url;
}

export function usePhotoUrl(path) {
  const [state, setState] = useState({ path: null, url: null });
  useEffect(() => {
    if (!path) return undefined;
    const request = { active: true };
    signedUrl(path).then(url => {
      if (request.active) setState({ path, url });
    });
    return () => {
      request.active = false;
    };
  }, [path]);
  return path && state.path === path ? state.url : null;
}

// foto mostrada na polaroid da mesa (a mais recente de vocês)
let polaroidPath = null;
const listeners = new Set();

export function setPolaroidPhoto(path) {
  if (path === polaroidPath) return;
  polaroidPath = path;
  listeners.forEach(fn => fn());
}

export function usePolaroidPhoto() {
  const path = useSyncExternalStore(
    fn => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => polaroidPath
  );
  return usePhotoUrl(path);
}
