import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { NOTE_STYLES, QUOTES, formatDate, seeded, shiftDate, todayISO } from '../lib/constants';
import { useTheme } from '../lib/theme';
import { removePhoto, uploadAudio, uploadPhoto } from '../lib/photos';
import { AudioPlayer, AudioRecorder } from './Audio';
import { friendlyError, useDraft } from '../lib/drafts';
import { Photo, PhotoPicker } from './Photo';

/** espalha as cartinhas numa grade com folga + desvio aleatório (estável por bilhete) */
function scatter(notes) {
  const n = notes.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * 1.8)));
  const rows = Math.max(1, Math.ceil(n / cols));
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  return notes.map((note, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: (col + 0.5) * cellW + (seeded(note.id, 1) - 0.5) * cellW * 0.45,
      y: (row + 0.5) * cellH + (seeded(note.id, 2) - 0.5) * cellH * 0.35,
      rot: (seeded(note.id, 3) - 0.5) * 16
    };
  });
}

function CardDeco({ style }) {
  if (style === 'envelope') return <span className="note-seal" aria-hidden="true">♥</span>;
  if (style === 'postal')
    return (
      <>
        <span className="note-stamp" aria-hidden="true">🌷</span>
        <span className="note-postmark" aria-hidden="true" />
      </>
    );
  if (style === 'bilhete') return <span className="note-tape" aria-hidden="true" />;
  return <span className="note-hearts" aria-hidden="true">♥ ♥ ♥</span>;
}

/** bilhete com data futura escrito pelo outro: chega lacrado e só abre no dia */
function isSealed(note, me, today) {
  // `sealed` vem do banco (texto nem chega); a data é a garantia extra no modo local
  return Boolean(note.sealed) || (note.note_date > today && note.author_id !== me.id);
}

function NoteCard({ note, author, pos, index, onOpen, sealed }) {
  return (
    <button
      className={`note-card style-${note.style}${sealed ? ' sealed' : ''}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, '--rot': `${pos.rot}deg`, '--i': index }}
      onClick={() => !sealed && onOpen(note)}
      aria-label={sealed ? `bilhete lacrado até ${formatDate(note.note_date)}` : `bilhete de ${author?.name ?? 'alguém'}`}
    >
      <CardDeco style={note.style} />
      {note.photo_path && !sealed && <Photo path={note.photo_path} className="note-mini-photo" />}
      {note.audio_path && !sealed && <span className="note-audio-badge" aria-label="tem recadinho de voz">🎙️</span>}
      <span className="note-text">
        {sealed ? `🔒 lacrado — só pode ser aberto em ${formatDate(note.note_date)}` : note.content}
      </span>
      {author && (
        <span className="note-from">
          — {author.emoji} {author.name}
        </span>
      )}
    </button>
  );
}

function NoteViewer({ note, author, me, onClose, onDeleted }) {
  const mine = note.author_id === me.id;
  async function remove() {
    if (!window.confirm('Jogar este bilhetinho fora? 🥺')) return;
    const { error } = await supabase.from('notes').delete().eq('id', note.id);
    if (error) window.alert(error.message);
    else {
      removePhoto(note.photo_path);
      removePhoto(note.audio_path);
      onDeleted();
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`note-card open style-${note.style}`} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <CardDeco style={note.style} />
        <p className="note-date">{formatDate(note.note_date)}</p>
        <Photo path={note.photo_path} className="note-photo" />
        <p className="note-text full">{note.content}</p>
        <AudioPlayer path={note.audio_path} />
        {author && (
          <p className="note-from">
            com carinho, {author.emoji} {author.name}
          </p>
        )}
        <div className="note-actions">
          {mine && (
            <button className="link-btn danger" onClick={remove}>
              jogar fora
            </button>
          )}
          <button className="wax-btn" onClick={onClose}>
            guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function NoteComposer({ date, userId, onClose, onSaved }) {
  const [{ content }, setDraft, clearDraft] = useDraft('bilhete', { content: '' });
  const setContent = v => setDraft({ content: v });
  const [style, setStyle] = useState('envelope');
  const [noteDate, setNoteDate] = useState(date);
  const [photoFile, setPhotoFile] = useState(null);
  const [audio, setAudio] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    const values = { content: content.trim(), style, note_date: noteDate };
    try {
      if (photoFile) values.photo_path = await uploadPhoto(photoFile, userId);
      if (audio) values.audio_path = await uploadAudio(audio, userId);
    } catch (uploadError) {
      setBusy(false);
      setError(`não deu para enviar: ${friendlyError(uploadError)}`);
      return;
    }
    const { error: err } = await supabase.from('notes').insert(values);
    setBusy(false);
    if (err) setError(friendlyError(err));
    else {
      clearDraft();
      onSaved(noteDate);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className={`note-card open composer style-${style}`} onClick={e => e.stopPropagation()} onSubmit={save}>
        <CardDeco style={style} />
        <p className="note-date">
          bilhetinho para{' '}
          <input type="date" className="date-input" value={noteDate} onChange={e => setNoteDate(e.target.value)} required />
        </p>
        <textarea
          className="note-input"
          placeholder="escreve aqui um recadinho…"
          value={content}
          maxLength={500}
          onChange={e => setContent(e.target.value)}
          autoFocus
          required
        />
        <PhotoPicker file={photoFile} onPick={setPhotoFile} onClear={() => setPhotoFile(null)} />
        <AudioRecorder blob={audio} onChange={setAudio} />
        {noteDate > todayISO() && <p className="note-hint">🔒 vai chegar lacrado: só dá para abrir em {formatDate(noteDate)}</p>}
        <div className="note-styles" role="group" aria-label="estilo da cartinha">
          {NOTE_STYLES.map(s => (
            <button
              type="button"
              key={s.id}
              className={`style-pick${style === s.id ? ' selected' : ''}`}
              onClick={() => setStyle(s.id)}
              aria-pressed={style === s.id}
              title={s.label}
            >
              <span aria-hidden="true">{s.icon}</span> {s.label}
            </button>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <div className="note-actions">
          <span className="note-count">{content.length}/500</span>
          <button type="button" className="link-btn" onClick={onClose}>
            cancelar
          </button>
          <button className="wax-btn" disabled={busy || !content.trim()}>
            {busy ? 'dobrando…' : 'deixar bilhete'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NotesBoard({ notes, notesMissing, profiles, me, onChanged, onBack, onGaveta, date, setDate, onOpenCalendar }) {
  const theme = useTheme();
  const [open, setOpen] = useState(null);
  const [writing, setWriting] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));

  const byId = useMemo(() => Object.fromEntries(profiles.map(p => [p.id, p])), [profiles]);
  const today = todayISO();
  const ofDay = useMemo(() => notes.filter(n => n.note_date === date), [notes, date]);
  const positions = useMemo(() => scatter(ofDay), [ofDay]);
  const sealedAhead = useMemo(() => notes.filter(n => isSealed(n, me, today)).length, [notes, me, today]);
  const lastBefore = useMemo(
    () => notes.filter(n => n.note_date < date).reduce((acc, n) => (n.note_date > acc ? n.note_date : acc), ''),
    [notes, date]
  );

  // o bilhete aberto pode ter sido apagado pelo outro em tempo real
  const openNote = open && notes.find(n => n.id === open.id);

  useEffect(() => {
    const onKey = e => {
      if (writing || openNote || e.target.closest?.('input, textarea')) return;
      if (e.key === 'ArrowLeft') setDate(shiftDate(date, -1));
      if (e.key === 'ArrowRight') setDate(shiftDate(date, 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [writing, openNote, date, setDate]);

  return (
    <section className="notes-board" aria-label="bilhetinhos">
      <header className="notes-strip">
        <button className="strip-link" onClick={() => setDate(shiftDate(date, -1))} aria-label="dia anterior">
          ‹
        </button>
        <span className="strip-day">
          {date === today ? 'hoje, ' : date === shiftDate(today, -1) ? 'ontem, ' : ''}
          {formatDate(date)}
        </span>
        <button className="strip-link" onClick={() => setDate(shiftDate(date, 1))} aria-label="próximo dia">
          ›
        </button>
        {date !== today && (
          <>
            <span className="strip-dot" aria-hidden="true">·</span>
            <button className="strip-link" onClick={() => setDate(today)}>
              hoje
            </button>
          </>
        )}
        <span className="strip-dot" aria-hidden="true">·</span>
        <button className="strip-link" onClick={onOpenCalendar} aria-label="calendário">
          📅
        </button>
        {sealedAhead > 0 && (
          <span className="strip-sealed" title="bilhetes com data futura">
            🔒 {sealedAhead} {sealedAhead === 1 ? 'lacrado' : 'lacrados'} esperando
          </span>
        )}
        <span className="strip-dot" aria-hidden="true">·</span>
        <button className="strip-link strong" onClick={() => setWriting(true)} disabled={notesMissing}>
          ✉ escrever bilhetinho
        </button>
        <span className="strip-dot" aria-hidden="true">·</span>
        <button className="strip-link" onClick={onGaveta}>
          🗝️ gaveta
        </button>
        <span className="strip-dot" aria-hidden="true">·</span>
        <button className="strip-link" onClick={onBack}>
          📖 voltar ao diário
        </button>
      </header>

      <div className="notes-area">
        {notesMissing ? (
          <div className="notes-empty note-card style-bilhete">
            <span className="note-tape" aria-hidden="true" />
            <p className="note-text full">
              Falta criar a gaveta dos bilhetes no banco: rode o arquivo <code>supabase/002_bilhetes.sql</code> no SQL
              Editor do Supabase e recarregue a página.
            </p>
          </div>
        ) : ofDay.length === 0 ? (
          <div className={`notes-empty note-card ${theme === 'moor' ? 'style-bilhete quote' : 'style-envelope'}`}>
            {theme === 'moor' ? (
              <>
                <span className="note-tape" aria-hidden="true" />
                <button className="note-text full quote-text" onClick={() => setQuoteIndex(i => (i + 1) % QUOTES.length)} title="outra citação">
                  “{QUOTES[quoteIndex]}”
                </button>
                <p className="note-from">— Emily Brontë</p>
              </>
            ) : (
              <>
                <span className="note-seal" aria-hidden="true">♥</span>
                <p className="note-text full">nenhum bilhetinho neste dia… que tal deixar um? 💌</p>
              </>
            )}
            {lastBefore && (
              <button className="link-btn" onClick={() => setDate(lastBefore)}>
                ver o último ({formatDate(lastBefore)})
              </button>
            )}
          </div>
        ) : (
          ofDay.map((note, i) => (
            <NoteCard
              key={note.id}
              note={note}
              author={byId[note.author_id]}
              pos={positions[i]}
              index={i}
              onOpen={setOpen}
              sealed={isSealed(note, me, today)}
            />
          ))
        )}
      </div>

      {openNote && (
        <NoteViewer
          note={openNote}
          author={byId[openNote.author_id]}
          me={me}
          onClose={() => setOpen(null)}
          onDeleted={() => {
            setOpen(null);
            onChanged();
          }}
        />
      )}
      {writing && (
        <NoteComposer
          date={date}
          userId={me.id}
          onClose={() => setWriting(false)}
          onSaved={d => {
            setWriting(false);
            setDate(d);
            onChanged();
          }}
        />
      )}
    </section>
  );
}
