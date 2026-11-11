import { useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LETTER_PROMPTS, formatDate, promptEmoji } from '../lib/constants';
import { SectionStrip } from './Gaveta';
import { friendlyError, useDraft } from '../lib/drafts';
import { notifyError } from '../lib/notify';

const dateOf = iso => formatDate(iso.slice(0, 10));

function LetterReader({ letter, author, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="note-card open style-envelope letter-open" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <span className="note-seal" aria-hidden="true">♥</span>
        <p className="note-date">
          abra quando {letter.prompt} {promptEmoji(letter.prompt)}
        </p>
        <p className="note-text full">{letter.content}</p>
        {author && (
          <p className="note-from">
            com todo amor, {author.emoji} {author.name}
          </p>
        )}
        <div className="note-actions">
          <button className="wax-btn" onClick={onClose}>
            guardar de volta
          </button>
        </div>
      </div>
    </div>
  );
}

function LetterWriter({ onClose, onSaved }) {
  const [prompt, setPrompt] = useState(LETTER_PROMPTS[0].prompt);
  const [{ custom, content }, setDraft, clearDraft] = useDraft('carta', { custom: '', content: '' });
  const setCustom = v => setDraft(d => ({ ...d, custom: v }));
  const setContent = v => setDraft(d => ({ ...d, content: v }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const finalPrompt = prompt === '__outro' ? custom.trim() : prompt;

  async function save(e) {
    e.preventDefault();
    if (!finalPrompt || !content.trim()) return;
    setBusy(true);
    const { error: err } = await supabase.from('letters').insert({ prompt: finalPrompt, content: content.trim() });
    setBusy(false);
    if (err) setError(friendlyError(err));
    else {
      clearDraft();
      onSaved();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="note-card open composer style-postal letter-writer" onClick={e => e.stopPropagation()} onSubmit={save}>
        <span className="note-stamp" aria-hidden="true">✉️</span>
        <p className="note-date">uma carta para guardar na gaveta</p>
        <div className="note-styles" role="group" aria-label="abra quando">
          {LETTER_PROMPTS.map(p => (
            <button
              type="button"
              key={p.prompt}
              className={`style-pick${prompt === p.prompt ? ' selected' : ''}`}
              onClick={() => setPrompt(p.prompt)}
              aria-pressed={prompt === p.prompt}
            >
              {p.emoji} {p.prompt}
            </button>
          ))}
          <button
            type="button"
            className={`style-pick${prompt === '__outro' ? ' selected' : ''}`}
            onClick={() => setPrompt('__outro')}
            aria-pressed={prompt === '__outro'}
          >
            ✏️ outro…
          </button>
        </div>
        {prompt === '__outro' && (
          <input
            className="title-input small"
            placeholder="abra quando…"
            maxLength={80}
            value={custom}
            onChange={e => setCustom(e.target.value)}
            autoFocus
          />
        )}
        <textarea
          className="note-input"
          placeholder="escreve com calma, ela vai ficar guardada até o momento certo…"
          maxLength={5000}
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <div className="note-actions">
          <span className="note-count">só abre quando a pessoa escolher abrir</span>
          <button type="button" className="link-btn" onClick={onClose}>
            cancelar
          </button>
          <button className="wax-btn" disabled={busy || !finalPrompt || !content.trim()}>
            {busy ? 'lacrando…' : 'lacrar e guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LettersView({ me, profiles, letters, closedLetters, missing, onChanged, onBack, onGaveta }) {
  const [reading, setReading] = useState(null);
  const [writing, setWriting] = useState(false);
  const byId = useMemo(() => Object.fromEntries(profiles.map(p => [p.id, p])), [profiles]);
  const partner = profiles.find(p => p.id !== me.id);
  const openedForMe = letters.filter(l => l.author_id !== me.id);
  const mine = letters.filter(l => l.author_id === me.id);

  async function open(letter) {
    if (!window.confirm(`Abrir agora a carta “abra quando ${letter.prompt}”?`)) return;
    const { data, error } = await supabase.rpc('open_letter', { p_id: letter.id });
    if (error) {
      notifyError(error, 'não deu para abrir a carta 🥺');
      return;
    }
    const opened = Array.isArray(data) ? data[0] : data;
    if (opened) setReading(opened);
    onChanged();
  }

  async function remove(letter) {
    if (!window.confirm('Rasgar esta carta? 🥺')) return;
    const { error } = await supabase.from('letters').delete().eq('id', letter.id);
    if (error) notifyError(error, 'não deu para rasgar a carta');
    else onChanged();
  }

  return (
    <section className="section-view">
      <SectionStrip title="✉️ cartas “abra quando…”" onBack={onBack} onGaveta={onGaveta}>
        <span className="strip-dot" aria-hidden="true">·</span>
        <button className="strip-link strong" onClick={() => setWriting(true)} disabled={missing}>
          escrever uma carta
        </button>
      </SectionStrip>

      {missing ? (
        <MissingSql />
      ) : (
        <div className="section-columns">
          <div className="paper-sheet">
            <h3>para você{partner ? `, de ${partner.name}` : ''}</h3>
            {closedLetters.length === 0 && openedForMe.length === 0 && (
              <p className="muted">nenhuma carta ainda… quando chegar, ela aparece aqui, lacrada 💌</p>
            )}
            <div className="letters-grid">
              {closedLetters.map(l => (
                <button key={l.id} className="envelope-btn" onClick={() => open(l)}>
                  <span className="env-flap" aria-hidden="true" />
                  <span className="env-seal" aria-hidden="true">♥</span>
                  <span className="env-label">
                    abra quando
                    <strong>
                      {l.prompt} {promptEmoji(l.prompt)}
                    </strong>
                  </span>
                </button>
              ))}
            </div>
            {openedForMe.length > 0 && (
              <>
                <h4>já abertas</h4>
                <ul className="letter-list">
                  {openedForMe.map(l => (
                    <li key={l.id}>
                      <button className="strip-link" onClick={() => setReading(l)}>
                        {promptEmoji(l.prompt)} abra quando {l.prompt}
                      </button>
                      <small>aberta em {dateOf(l.opened_at)}</small>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="paper-sheet">
            <h3>que você guardou{partner ? ` para ${partner.name}` : ''}</h3>
            {mine.length === 0 && <p className="muted">deixa uma carta para um momento especial ✍️</p>}
            <ul className="letter-list">
              {mine.map(l => (
                <li key={l.id}>
                  <button className="strip-link" onClick={() => setReading(l)}>
                    {promptEmoji(l.prompt)} abra quando {l.prompt}
                  </button>
                  <small>{l.opened_at ? `aberta em ${dateOf(l.opened_at)} 💕` : '🔒 ainda fechada'}</small>
                  <button className="link-btn danger tiny" onClick={() => remove(l)}>
                    rasgar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {reading && <LetterReader letter={reading} author={byId[reading.author_id]} onClose={() => setReading(null)} />}
      {writing && (
        <LetterWriter
          onClose={() => setWriting(false)}
          onSaved={() => {
            setWriting(false);
            onChanged();
          }}
        />
      )}
    </section>
  );
}

export function MissingSql() {
  return (
    <div className="paper-sheet narrow-sheet">
      <p>
        Falta preparar este cantinho no banco: rode o arquivo <code>supabase/004_cantinhos.sql</code> no SQL Editor do
        Supabase e recarregue a página.
      </p>
    </div>
  );
}
