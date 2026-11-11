import { useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { COUNTDOWN_EMOJIS, WISH_CATEGORIES, daysBetween, formatDate, todayISO, wishEmoji } from '../lib/constants';
import { removePhoto, uploadPhoto } from '../lib/photos';
import { SectionStrip } from './Gaveta';
import { MissingSql } from './LettersView';
import { Photo, PhotoPicker } from './Photo';
import { friendlyError } from '../lib/drafts';
import { notifyError } from '../lib/notify';

const dateOf = iso => formatDate(iso.slice(0, 10));

function countdownText(target, today) {
  const days = daysBetween(today, target);
  if (days === 0) return 'é hoje! 🎉';
  if (days === 1) return 'é amanhã!';
  if (days > 1) return `faltam ${days} dias`;
  return `foi há ${-days} ${days === -1 ? 'dia' : 'dias'}`;
}

/** contagem regressiva mais próxima, em cima da mesa */
export function CountdownPill({ countdowns, onOpen }) {
  const today = todayISO();
  const next = countdowns.find(c => c.target_date >= today);
  if (!next) return null;
  return (
    <button className="countdown-pill" onClick={onOpen} title="ver contagens">
      <span className="cd-emoji" aria-hidden="true">
        {next.emoji}
      </span>
      <span>
        <strong>{countdownText(next.target_date, today)}</strong> para {next.title}
      </span>
    </button>
  );
}

function DoneDialog({ item, userId, onClose, onSaved }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setBusy(true);
    const values = { done_at: new Date().toISOString(), done_by: userId };
    try {
      if (file) values.photo_path = await uploadPhoto(file, userId);
    } catch (e) {
      setBusy(false);
      setError(`não deu para enviar a foto: ${friendlyError(e)}`);
      return;
    }
    const { error: err } = await supabase.from('wishlist').update(values).eq('id', item.id);
    setBusy(false);
    if (err) setError(friendlyError(err));
    else onSaved();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="note-card open style-bilhete" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <span className="note-tape" aria-hidden="true" />
        <p className="note-date">realizado! 🎉</p>
        <p className="note-text full">
          {wishEmoji(item.category)} {item.title}
        </p>
        <p className="muted">quer guardar uma foto desse momento?</p>
        <PhotoPicker file={file} onPick={setFile} onClear={() => setFile(null)} />
        {error && <p className="error">{error}</p>}
        <div className="note-actions">
          <button className="link-btn" onClick={onClose}>
            cancelar
          </button>
          <button className="wax-btn" onClick={save} disabled={busy}>
            {busy ? 'guardando…' : 'marcar como feito'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Wishlist({ me, byId, items, onChanged }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('lugar');
  const [tab, setTab] = useState('fazer');
  const [doneItem, setDoneItem] = useState(null);
  const shown = items.filter(i => (tab === 'fazer' ? !i.done_at : i.done_at));

  async function add(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const { error } = await supabase.from('wishlist').insert({ title: title.trim(), category });
    if (error) notifyError(error);
    else {
      setTitle('');
      onChanged();
    }
  }

  async function undo(item) {
    const { error } = await supabase.from('wishlist').update({ done_at: null, done_by: null, photo_path: null }).eq('id', item.id);
    if (error) notifyError(error);
    else {
      removePhoto(item.photo_path);
      onChanged();
    }
  }

  async function remove(item) {
    if (!window.confirm(`Tirar “${item.title}” da lista?`)) return;
    const { error } = await supabase.from('wishlist').delete().eq('id', item.id);
    if (error) notifyError(error, 'não deu para tirar da lista');
    else {
      removePhoto(item.photo_path);
      onChanged();
    }
  }

  return (
    <div className="paper-sheet list-sheet">
      <h3>📝 nossa lista</h3>
      <form className="wish-add" onSubmit={add}>
        <input className="title-input small" placeholder="algo para fazermos juntos…" maxLength={200} value={title} onChange={e => setTitle(e.target.value)} />
        <div className="note-styles">
          {WISH_CATEGORIES.map(c => (
            <button
              type="button"
              key={c.id}
              className={`style-pick${category === c.id ? ' selected' : ''}`}
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        <button className="wax-btn small" disabled={!title.trim()}>
          adicionar
        </button>
      </form>

      <div className="list-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'fazer'} className={`strip-link${tab === 'fazer' ? ' strong' : ''}`} onClick={() => setTab('fazer')}>
          para fazer ({items.filter(i => !i.done_at).length})
        </button>
        <span className="strip-dot">·</span>
        <button role="tab" aria-selected={tab === 'feitos'} className={`strip-link${tab === 'feitos' ? ' strong' : ''}`} onClick={() => setTab('feitos')}>
          já fizemos ({items.filter(i => i.done_at).length})
        </button>
      </div>

      {shown.length === 0 && <p className="muted">{tab === 'fazer' ? 'a lista está vazia… sonhem alto ✨' : 'nada riscado ainda'}</p>}
      <ul className="wish-list">
        {shown.map(item => (
          <li key={item.id} className={item.done_at ? 'done' : ''}>
            <button
              className={`wish-check${item.done_at ? ' on' : ''}`}
              onClick={() => (item.done_at ? undo(item) : setDoneItem(item))}
              aria-label={item.done_at ? 'desmarcar' : 'marcar como feito'}
            >
              {item.done_at ? '✓' : ''}
            </button>
            <span className="wish-body">
              <span className="wish-title">
                {wishEmoji(item.category)} {item.title}
              </span>
              <small>
                {item.done_at
                  ? `feito em ${dateOf(item.done_at)}${item.done_by && byId[item.done_by] ? ` · marcado por ${byId[item.done_by].name}` : ''}`
                  : `ideia de ${byId[item.author_id]?.name ?? '—'}`}
              </small>
            </span>
            {item.photo_path && <Photo path={item.photo_path} className="wish-photo" />}
            <button className="link-btn danger tiny" onClick={() => remove(item)} aria-label="tirar da lista">
              ✕
            </button>
          </li>
        ))}
      </ul>

      {doneItem && (
        <DoneDialog
          item={doneItem}
          userId={me.id}
          onClose={() => setDoneItem(null)}
          onSaved={() => {
            setDoneItem(null);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function Countdowns({ items, onChanged }) {
  const today = todayISO();
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState(COUNTDOWN_EMOJIS[0]);
  const [date, setDate] = useState('');
  const upcoming = items.filter(c => c.target_date >= today);
  const past = items.filter(c => c.target_date < today).slice(-3).reverse();

  async function add(e) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    const { error } = await supabase.from('countdowns').insert({ title: title.trim(), emoji, target_date: date });
    if (error) notifyError(error);
    else {
      setTitle('');
      setDate('');
      onChanged();
    }
  }

  async function remove(c) {
    if (!window.confirm(`Apagar a contagem “${c.title}”?`)) return;
    const { error } = await supabase.from('countdowns').delete().eq('id', c.id);
    if (error) notifyError(error, 'não deu para apagar a contagem');
    else onChanged();
  }

  return (
    <div className="paper-sheet countdown-sheet">
      <h3>⏳ contagens</h3>
      {upcoming.length === 0 && <p className="muted">nenhuma data esperada ainda</p>}
      <ul className="countdown-list">
        {upcoming.map(c => (
          <li key={c.id}>
            <span className="cd-emoji big" aria-hidden="true">
              {c.emoji}
            </span>
            <span className="cd-body">
              <strong>{countdownText(c.target_date, today)}</strong>
              <span>para {c.title}</span>
              <small>{formatDate(c.target_date)}</small>
            </span>
            <button className="link-btn danger tiny" onClick={() => remove(c)} aria-label="apagar contagem">
              ✕
            </button>
          </li>
        ))}
        {past.map(c => (
          <li key={c.id} className="past">
            <span className="cd-emoji" aria-hidden="true">
              {c.emoji}
            </span>
            <span className="cd-body">
              <span>
                {c.title} — {countdownText(c.target_date, today)}
              </span>
            </span>
            <button className="link-btn danger tiny" onClick={() => remove(c)} aria-label="apagar contagem">
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form className="cd-add" onSubmit={add}>
        <input className="title-input small" placeholder="esperando o quê?" maxLength={80} value={title} onChange={e => setTitle(e.target.value)} />
        <div className="emoji-row">
          {COUNTDOWN_EMOJIS.map(e => (
            <button type="button" key={e} className={`mood${emoji === e ? ' selected' : ''}`} onClick={() => setEmoji(e)} aria-pressed={emoji === e}>
              {e}
            </button>
          ))}
        </div>
        <div className="cd-add-row">
          <input type="date" className="date-input" min={today} value={date} onChange={e => setDate(e.target.value)} required />
          <button className="wax-btn small" disabled={!title.trim() || !date}>
            começar a contar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PlansView({ me, profiles, wishlist, countdowns, missing, onChanged, onBack, onGaveta }) {
  const byId = useMemo(() => Object.fromEntries(profiles.map(p => [p.id, p])), [profiles]);
  return (
    <section className="section-view">
      <SectionStrip title="📝 nossos planos" onBack={onBack} onGaveta={onGaveta} />
      {missing ? (
        <MissingSql />
      ) : (
        <div className="section-columns">
          <Wishlist me={me} byId={byId} items={wishlist} onChanged={onChanged} />
          <Countdowns items={countdowns} onChanged={onChanged} />
        </div>
      )}
    </section>
  );
}
