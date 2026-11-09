import { createClient } from '@supabase/supabase-js';
import { createLocalClient } from './localClient';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sem .env.local configurado, o diário roda só no navegador (dados no localStorage).
// Para ligar o Supabase depois, basta preencher o .env.local (veja o README).
export const usingSupabase = Boolean(url && anonKey && !url.includes('SEU-PROJETO'));

export const supabase = usingSupabase ? createClient(url, anonKey) : createLocalClient();
