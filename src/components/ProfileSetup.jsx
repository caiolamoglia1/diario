import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AVATARS, COLORS } from '../lib/constants';

export default function ProfileSetup({ userId, initial, onDone, onCancel }) {
  const editing = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? AVATARS[0]);
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const values = { name: name.trim(), emoji, color };
    const { error: err } = editing
      ? await supabase.from('profiles').update(values).eq('id', userId)
      : await supabase.from('profiles').insert({ id: userId, ...values });
    setBusy(false);
    if (err) {
      setError(err.message.includes('duas pessoas') ? 'Este diário já tem duas pessoas 💕' : err.message);
      return;
    }
    onDone();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const form = (
    <form className="paper-card narrow" onSubmit={handleSubmit}>
      <div className="avatar xl" style={{ '--c': color }}>
        {emoji}
      </div>
      <h1 className="title center">{editing ? 'editar perfil' : 'quem é você?'}</h1>
      {!editing && <p className="muted center">escolha como você vai aparecer no diário</p>}

      <label className="field">
        <span>seu nome (ou apelido fofo)</span>
        <input required maxLength={40} value={name} onChange={e => setName(e.target.value)} placeholder="ex: mozão" />
      </label>

      <div className="field">
        <span>bichinho</span>
        <div className="chip-row">
          {AVATARS.map(a => (
            <button
              type="button"
              key={a}
              className={`emoji-chip${a === emoji ? ' selected' : ''}`}
              onClick={() => setEmoji(a)}
              aria-label={a}
              aria-pressed={a === emoji}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>sua cor</span>
        <div className="chip-row">
          {COLORS.map(c => (
            <button
              type="button"
              key={c}
              className={`color-chip${c === color ? ' selected' : ''}`}
              style={{ '--c': c }}
              onClick={() => setColor(c)}
              aria-label={`cor ${c}`}
              aria-pressed={c === color}
            />
          ))}
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="row end">
        {editing ? (
          <button type="button" className="btn ghost" onClick={onCancel}>
            cancelar
          </button>
        ) : (
          <button type="button" className="btn ghost" onClick={handleLogout}>
            sair
          </button>
        )}
        <button className="btn primary" disabled={busy || !name.trim()}>
          {busy ? 'salvando…' : editing ? 'salvar' : 'pronto! 💖'}
        </button>
      </div>
    </form>
  );

  if (editing) return form;
  return <div className="center-screen">{form}</div>;
}
