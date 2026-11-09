import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CoverArt } from './pages';
import { Bookmarks } from './Book';

const ERRORS = {
  'Invalid login credentials': 'e-mail ou senha incorretos 🥺',
  'Email not confirmed': 'esse e-mail ainda não foi confirmado'
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) setError(ERRORS[err.message] ?? err.message);
    setBusy(false);
  }

  return (
    <div className="book-stage">
      <div className="book static-cover">
        <div className="page-block right under-cover" />
        <Bookmarks />
        <div className="face front cover">
          <CoverArt>
            <form className="lock-plate" onSubmit={handleSubmit}>
              <p className="plate-label">só para nós dois 🔒</p>
              <input
                type="email"
                placeholder="e-mail"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="senha"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {error && <p className="error">{error}</p>}
              <button className="wax-btn" disabled={busy}>
                {busy ? 'abrindo…' : 'abrir o diário'}
              </button>
            </form>
          </CoverArt>
        </div>
      </div>
    </div>
  );
}
