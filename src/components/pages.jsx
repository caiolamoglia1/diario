import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { MOODS, QUOTES, REACTIONS, daysBetween, formatDate, todayISO } from '../lib/constants';
import { removePhoto, uploadPhoto } from '../lib/photos';
import { notificationsSupported, toggleNotifications, useNotificationsEnabled } from '../lib/notify';
import { Photo, PhotoPicker } from './Photo';
import BlurText from './reactbits/BlurText/BlurText';
import { CornerOrnament, Flourish, KeyCharm, Keyhole } from './DeskProps';
import { FloralWreath, Moon, PostStamps, PressedFlower, RibbonBow, StarField, TwineBow } from './CoverStyles';
import { COVERS, useCover } from '../lib/cover';

/* ---------- capa ---------- */
const COVER_STARS = [
  [18, 22, 9], [80, 18, 7], [14, 64, 7], [84, 58, 9], [24, 84, 6], [76, 86, 7], [50, 12, 6], [88, 36, 5]
];

function CoverDecor() {
  return (
    <>
      <div className="cover-spine" aria-hidden="true" />
      <div className="cover-stitch" aria-hidden="true" />
      <CornerOrnament className="tl" />
      <CornerOrnament className="tr" />
      <CornerOrnament className="bl" />
      <CornerOrnament className="br" />
      {COVER_STARS.map(([x, y, s], i) => (
        <span
          key={i}
          className="cover-star"
          style={{ left: `${x}%`, top: `${y}%`, fontSize: s * 1.6, animationDelay: `${i * 0.37}s` }}
          aria-hidden="true"
        >
          ✦
        </span>
      ))}
    </>
  );
}

export function CoverArt({ members = [], children, animateTitle = true, variant }) {
  const chosen = useCover();
  const cover = variant ?? chosen;
  const names = members.map(m => m.name).join(' & ');
  const title = animateTitle ? (
    <BlurText text="Nosso Diário" className="cover-title" delay={90} animateBy="letters" />
  ) : (
    <h1 className="cover-title">Nosso Diário</h1>
  );
  const bottom = (
    <>
      {children ?? (names && <p className="cover-names">{names}</p>)}
      {!children && <p className="cover-hint">✦ toque para abrir ✦</p>}
    </>
  );

  if (cover === 'linho') {
    return (
      <div className="cover-art cs-linho">
        <div className="cs-spine" aria-hidden="true" />
        <div className="cover-frame">
          <div className="cs-wreath-wrap">
            <FloralWreath />
            <div className="cs-wreath-text">
              {title}
              <div className="cover-heart">❀</div>
            </div>
          </div>
          {bottom}
        </div>
        <RibbonBow />
      </div>
    );
  }

  if (cover === 'estrelado') {
    return (
      <div className="cover-art cs-estrelado">
        <StarField />
        <div className="cs-spine" aria-hidden="true" />
        <div className="cover-frame">
          <Moon />
          {title}
          <div className="cover-heart">✦</div>
          {bottom}
        </div>
        <div className="cs-elastic" aria-hidden="true" />
      </div>
    );
  }

  if (cover === 'aquarela') {
    return (
      <div className="cover-art cs-aquarela">
        <span className="cs-blob b1" aria-hidden="true" />
        <span className="cs-blob b2" aria-hidden="true" />
        <span className="cs-blob b3" aria-hidden="true" />
        <span className="cs-washi" aria-hidden="true" />
        <PressedFlower className="pf-1" />
        <PressedFlower className="pf-2" color="#b9a3e3" />
        <PressedFlower className="pf-3" color="#f2a97e" />
        <div className="cover-frame">
          {title}
          <div className="cover-heart">♡</div>
          {bottom}
        </div>
      </div>
    );
  }

  if (cover === 'vintage') {
    return (
      <div className="cover-art cs-vintage">
        <div className="cs-spine" aria-hidden="true" />
        <PostStamps />
        <span className="cs-twine h" aria-hidden="true" />
        <span className="cs-twine v" aria-hidden="true" />
        <TwineBow />
        <div className="cover-frame">
          <div className="cs-label">
            {title}
            {bottom}
          </div>
        </div>
        <span className="cs-wax" aria-hidden="true">♥</span>
      </div>
    );
  }

  // couro clássico
  return (
    <div className="cover-art">
      <CoverDecor />
      <div className="cover-frame">
        <Flourish />
        <span className="cover-ornament">✦</span>
        {title}
        <div className="cover-heart">♥</div>
        {bottom}
        <Flourish />
      </div>
      <div className="cover-strap" aria-hidden="true">
        <span className="clasp">
          <span className="clasp-heart">♥</span>
          <Keyhole />
        </span>
        <KeyCharm />
      </div>
    </div>
  );
}

export function BackCover() {
  const cover = useCover();
  if (cover !== 'classico') {
    return (
      <div className={`cover-art back-cover cs-${cover}`}>
        {(cover === 'linho' || cover === 'vintage') && <div className="cs-spine right" aria-hidden="true" />}
      </div>
    );
  }
  return (
    <div className="cover-art back-cover">
      <div className="cover-stitch" aria-hidden="true" />
      <div className="cover-frame">
        <Flourish />
      </div>
    </div>
  );
}

/* ---------- contracapa: ex libris ---------- */
export function InsideCover({
  members,
  entriesCount,
  firstDate,
  onEditProfile,
  onLogout,
  notesToday,
  onOpenNotes,
  togetherSince,
  onSetTogetherSince
}) {
  const [a, b] = members;
  return (
    <div className="endpaper-inner">
      <div className="bookplate">
        <p className="ex-libris">ex libris</p>
        <p className="plate-label">este diário pertence a</p>
        <div className="owners">
          {a && <Owner p={a} />}
          <span className="amp">&amp;</span>
          {b ? <Owner p={b} /> : <span className="waiting">alguém especial 💌</span>}
        </div>
        <div className="divider">✦ ✦ ✦</div>
        <p className="plate-stats">
          {entriesCount === 0
            ? 'nenhuma página escrita ainda'
            : `${entriesCount} ${entriesCount === 1 ? 'página escrita' : 'páginas escritas'}`}
          {firstDate && (
            <>
              <br />
              desde {formatDate(firstDate)}
            </>
          )}
        </p>
        <Together since={togetherSince} onSet={onSetTogetherSince} />
        <NotesLine count={notesToday} onOpen={onOpenNotes} />
        <div className="plate-actions">
          <button className="link-btn" onClick={onEditProfile}>
            editar meu perfil
          </button>
          <NotificationsToggle />
          <span>·</span>
          <button className="link-btn" onClick={onLogout}>
            sair
          </button>
        </div>
      </div>
    </div>
  );
}

/** contador "juntos há X dias" + escolher a data */
function Together({ since, onSet }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(since ?? '');
  if (!onSet) return null; // tabela ainda não criada no Supabase
  if (!since || editing) {
    return (
      <form
        className="together-form"
        onSubmit={e => {
          e.preventDefault();
          if (!value) return;
          onSet(value);
          setEditing(false);
        }}
      >
        <span>quando começou a nossa história?</span>
        <input type="date" className="date-input" value={value} max={todayISO()} onChange={e => setValue(e.target.value)} required />
        <button className="link-btn">guardar</button>
      </form>
    );
  }
  const days = daysBetween(since, todayISO());
  return (
    <p className="together">
      <span className="together-count">juntos há {days.toLocaleString('pt-BR')} {days === 1 ? 'dia' : 'dias'}</span> 💞
      <button
        className="link-btn tiny"
        onClick={() => {
          setValue(since);
          setEditing(true);
        }}
      >
        mudar data
      </button>
    </p>
  );
}

function NotificationsToggle() {
  const enabled = useNotificationsEnabled();
  if (!notificationsSupported) return null;
  return (
    <>
      <span>·</span>
      <button className="link-btn" onClick={toggleNotifications}>
        {enabled ? '🔔 avisos ligados' : '🔕 ativar avisos'}
      </button>
    </>
  );
}

function Owner({ p }) {
  return (
    <span className="owner">
      <span className="avatar" style={{ '--c': p.color }}>
        {p.emoji}
      </span>
      <span className="script">{p.name}</span>
    </span>
  );
}

/* ---------- linha "bilhetinhos" dentro do livro ---------- */
export function NotesLine({ count, onOpen }) {
  if (!onOpen) return null;
  return (
    <button className="notes-line" onClick={onOpen}>
      <span aria-hidden="true">💌</span>{' '}
      {count > 0 ? `${count} ${count === 1 ? 'bilhetinho' : 'bilhetinhos'} hoje` : 'bilhetinhos do dia'}
      <span className="notes-line-cta"> — ler ›</span>
    </button>
  );
}

/* ---------- formulário (página nova e edição) ---------- */
export function EntryForm({ initial, userId, onSubmit, onCancel, submitLabel = 'guardar no diário' }) {
  const [entryDate, setEntryDate] = useState(initial?.entry_date ?? todayISO());
  const [mood, setMood] = useState(initial?.mood ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    setError('');
    const values = {
      entry_date: entryDate,
      mood: mood || null,
      title: title.trim() || null,
      content: content.trim()
    };
    // só manda photo_path quando a foto mudou (assim funciona mesmo sem o 003 rodado)
    try {
      if (photoFile) values.photo_path = await uploadPhoto(photoFile, userId);
      else if (photoRemoved) values.photo_path = null;
    } catch (uploadError) {
      setBusy(false);
      setError(`não deu para enviar a foto: ${uploadError.message}`);
      return;
    }
    const err = await onSubmit(values);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    if ((photoFile || photoRemoved) && initial?.photo_path) removePhoto(initial.photo_path);
    setPhotoFile(null);
    setPhotoRemoved(false);
    if (!initial) {
      setTitle('');
      setContent('');
      setMood('');
    }
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <div className="form-top">
        <input
          type="date"
          className="date-input"
          value={entryDate}
          max={todayISO()}
          onChange={e => setEntryDate(e.target.value)}
          aria-label="data"
        />
        <div className="moods" role="group" aria-label="como você está?">
          {MOODS.map(m => (
            <button
              type="button"
              key={m.emoji}
              title={m.label}
              aria-label={m.label}
              aria-pressed={mood === m.emoji}
              className={`mood${mood === m.emoji ? ' selected' : ''}`}
              onClick={() => setMood(mood === m.emoji ? '' : m.emoji)}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>
      <input
        className="title-input"
        placeholder="um título (opcional)"
        maxLength={120}
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        className="lined"
        placeholder="Querido diário, hoje…"
        value={content}
        onChange={e => setContent(e.target.value)}
        maxLength={20000}
        required
      />
      <PhotoPicker
        file={photoFile}
        existingPath={photoRemoved ? null : initial?.photo_path}
        onPick={f => {
          setPhotoFile(f);
          setPhotoRemoved(false);
        }}
        onClear={() => {
          setPhotoFile(null);
          setPhotoRemoved(true);
        }}
      />
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="link-btn" onClick={onCancel}>
            cancelar
          </button>
        )}
        <button className="wax-btn" disabled={busy || !content.trim()}>
          {busy ? 'guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function WritePage({ me, onCreate, pageNumber, notesToday, onOpenNotes }) {
  return (
    <div className="page-inner">
      <header className="page-head">
        <p className="eyebrow">uma página em branco para</p>
        <h2 className="page-title">
          <span className="avatar sm" style={{ '--c': me.color }}>
            {me.emoji}
          </span>{' '}
          {me.name}
        </h2>
      </header>
      <NotesLine count={notesToday} onOpen={onOpenNotes} />
      <EntryForm onSubmit={onCreate} userId={me.id} />
      <PageNumber n={pageNumber} />
    </div>
  );
}

/* ---------- página escrita ---------- */
export function EntryPage({ entry, author, me, onChanged, pageNumber }) {
  const [editing, setEditing] = useState(false);
  const mine = entry.author_id === me.id;
  const mood = MOODS.find(m => m.emoji === entry.mood);

  async function save(values) {
    const { error } = await supabase
      .from('entries')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', entry.id);
    if (error) return error.message;
    setEditing(false);
    onChanged();
    return null;
  }

  async function remove() {
    if (!window.confirm('Arrancar esta página do diário? Não dá para desfazer 🥺')) return;
    const { error } = await supabase.from('entries').delete().eq('id', entry.id);
    if (error) window.alert(error.message);
    else {
      removePhoto(entry.photo_path);
      onChanged();
    }
  }

  async function toggleReaction(emoji) {
    const already = entry.reactions.some(r => r.user_id === me.id && r.emoji === emoji);
    const query = already
      ? supabase.from('reactions').delete().match({ entry_id: entry.id, user_id: me.id, emoji })
      : supabase.from('reactions').insert({ entry_id: entry.id, user_id: me.id, emoji });
    const { error } = await query;
    if (!error) onChanged();
  }

  if (editing) {
    return (
      <div className="page-inner">
        <header className="page-head">
          <p className="eyebrow">editando</p>
        </header>
        <EntryForm initial={entry} userId={me.id} onSubmit={save} onCancel={() => setEditing(false)} submitLabel="salvar" />
        <PageNumber n={pageNumber} />
      </div>
    );
  }

  return (
    <div className="page-inner">
      <header className="page-head">
        <p className="entry-date">{formatDate(entry.entry_date)}</p>
        <div className="entry-meta">
          {author && (
            <span className="author" style={{ '--c': author.color }}>
              <span className="avatar sm" style={{ '--c': author.color }}>
                {author.emoji}
              </span>
              {author.name}
            </span>
          )}
          {mood && (
            <span className="mood-tag" title={mood.label}>
              {mood.emoji} {mood.label}
            </span>
          )}
        </div>
        {entry.title && <h2 className="page-title">{entry.title}</h2>}
      </header>

      <Photo path={entry.photo_path} className="entry-photo" />
      <div className="entry-body lined-bg">{entry.content}</div>

      <footer className="entry-foot">
        <div className="reactions">
          {REACTIONS.map(emoji => {
            const who = entry.reactions.filter(r => r.emoji === emoji);
            const minePressed = who.some(r => r.user_id === me.id);
            return (
              <button
                key={emoji}
                className={`reaction${minePressed ? ' on' : ''}${who.length ? ' has' : ''}`}
                onClick={() => toggleReaction(emoji)}
                aria-pressed={minePressed}
              >
                {emoji}
                {who.length > 0 && <small>{who.length}</small>}
              </button>
            );
          })}
        </div>
        {mine && (
          <div className="entry-actions">
            <button className="link-btn" onClick={() => setEditing(true)}>
              editar
            </button>
            <button className="link-btn danger" onClick={remove}>
              arrancar
            </button>
          </div>
        )}
      </footer>
      {author && <p className="signature script">com carinho, {author.name}</p>}
      <PageNumber n={pageNumber} />
    </div>
  );
}

export function EndNote() {
  return (
    <div className="page-inner end-note">
      <p className="script big">continua…</p>
      <p className="muted">as melhores páginas ainda vão ser escritas ✨</p>
    </div>
  );
}

export function EmptyNote() {
  return (
    <div className="page-inner end-note">
      <p className="script big">a primeira página</p>
      <p className="muted">nada escrito ainda… que tal começar a nossa história? →</p>
    </div>
  );
}

function PageNumber({ n }) {
  if (!n) return null;
  return <span className="page-number">— {n} —</span>;
}

/* ---------- clima do diário (última página) ---------- */
const THEME_OPTIONS = [
  {
    id: 'cozy',
    name: 'Aconchego',
    desc: 'madeira quente, café, corações e luz de vela',
    swatch: ['#a8663a', '#8c3550', '#fbf6ea', '#e9a1b4']
  },
  {
    id: 'moor',
    name: 'Morro dos Ventos Uivantes',
    desc: 'névoa fria, rosas secas, vela preta e vento na charneca',
    swatch: ['#2a1f1b', '#3d0f1c', '#e9dfc8', '#9fb4cc']
  }
];

export function ThemePage({ theme, onChange, onPickCover }) {
  const [quote, setQuote] = useState(0);
  const cover = useCover();
  return (
    <div className="page-inner theme-page">
      <header className="page-head">
        <p className="eyebrow">antes de fechar o diário…</p>
        <h2 className="page-title">o clima das nossas páginas</h2>
      </header>
      <div className="theme-options">
        {THEME_OPTIONS.map(opt => (
          <button
            key={opt.id}
            className={`theme-card ${opt.id}${theme === opt.id ? ' selected' : ''}`}
            onClick={() => onChange(opt.id)}
            aria-pressed={theme === opt.id}
          >
            <span className="theme-swatch" aria-hidden="true">
              {opt.swatch.map(c => (
                <span key={c} style={{ background: c }} />
              ))}
            </span>
            <span className="theme-text">
              <strong>{opt.name}</strong>
              <small>{opt.desc}</small>
            </span>
            <span className="theme-check" aria-hidden="true">{theme === opt.id ? '✦' : ''}</span>
          </button>
        ))}
      </div>
      <h3 className="cover-pick-title">a capa do nosso diário</h3>
      <div className="cover-picker" role="group" aria-label="capa do diário">
        {COVERS.map(c => (
          <button
            key={c.id}
            className={`cover-mini cs-${c.id}${cover === c.id ? ' selected' : ''}`}
            onClick={() => onPickCover?.(c.id)}
            aria-pressed={cover === c.id}
            title={c.desc}
          >
            <span className="cover-mini-title">Nosso Diário</span>
            <span className="cover-mini-name">{c.name}</span>
          </button>
        ))}
      </div>
      <blockquote className="theme-quote">
        <span key={quote} className="quote-fade">“{QUOTES[quote]}”</span>
        <cite>— Emily Brontë, O Morro dos Ventos Uivantes</cite>
        <button className="link-btn" onClick={() => setQuote(q => (q + 1) % QUOTES.length)}>
          outra citação ✦
        </button>
      </blockquote>
    </div>
  );
}
