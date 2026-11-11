import { useCallback, useEffect, useRef, useState } from 'react';

// Rascunho automático: o que está sendo escrito fica guardado no aparelho
// até ser salvo de verdade. Se o salvamento falhar (sem internet, sessão
// expirada…), o texto continua lá.
const PREFIX = 'nosso-diario:rascunho:';

function read(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Igual a useState, mas guardando no aparelho. `key = null` desliga (ex.: editando algo já salvo).
 * Devolve [valor, setValor, limpar, restaurado?]
 */
export function useDraft(key, initial) {
  const [restored] = useState(() => (key ? read(key) : null));
  const [value, setValue] = useState(() => (restored ? { ...initial, ...restored } : initial));
  const timer = useRef(0);

  useEffect(() => {
    if (!key) return undefined;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        // só conta o que a pessoa escreveu (data e humor sozinhos não viram rascunho)
        const hasText = ['content', 'text', 'title', 'custom'].some(k => typeof value[k] === 'string' && value[k].trim());
        if (hasText) localStorage.setItem(PREFIX + key, JSON.stringify(value));
        else localStorage.removeItem(PREFIX + key);
      } catch {
        // sem espaço / sem localStorage: segue sem rascunho
      }
    }, 400);
    return () => clearTimeout(timer.current);
  }, [key, value]);

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    try {
      if (key) localStorage.removeItem(PREFIX + key);
    } catch {
      // ignora
    }
  }, [key]);

  return [value, setValue, clear, Boolean(restored)];
}

/** mensagem clara para os erros mais comuns ao salvar */
export function friendlyError(error) {
  const message = typeof error === 'string' ? error : error?.message ?? '';
  if (!navigator.onLine || /failed to fetch|networkerror|load failed|network request failed/i.test(message)) {
    return 'sem internet agora — seu texto ficou guardado aqui como rascunho, tente de novo daqui a pouco';
  }
  if (/jwt|token|expired|not authenticated|401/i.test(message)) {
    return 'sua sessão expirou — saia e entre de novo (o texto ficou guardado como rascunho)';
  }
  if (/row-level security|violates row-level|permission denied|42501/i.test(message)) {
    return 'o banco recusou salvar (permissão). Seu texto ficou guardado como rascunho';
  }
  if (/check constraint|too long|value too long/i.test(message)) {
    return 'o texto passou do tamanho permitido';
  }
  return message || 'algo deu errado ao salvar';
}
