import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import Book from './Book';
import { leavesToShow, maxLeaves, useSinglePage } from '../lib/book';
import { BackCover, CoverArt, EndNote, EntryPage, InsideCover, ThemePage, WritePage } from './pages';
import { setTheme, useTheme } from '../lib/theme';
import { specialDay, todayISO } from '../lib/constants';
import { dismissToast, useToasts } from '../lib/notify';
import useDiaryData from '../lib/useDiaryData';
import Calendar from './Calendar';
import ProfileSetup from './ProfileSetup';
import NotesBoard from './NotesBoard';
import LettersView from './LettersView';
import QuestionView from './QuestionView';
import PlansView, { CountdownPill } from './PlansView';
import RetroView from './RetroView';
import SearchModal from './SearchModal';
import UpdatesView from './UpdatesView';
import { Gaveta } from './Gaveta';
import { hasUnseenUpdates } from '../lib/changelog';

export default function Diary({ me, onProfileChange }) {
  const single = useSinglePage();
  const theme = useTheme();
  const data = useDiaryData(me);
  const { profiles, entries, notes, settings, missing, load, saveTogetherSince } = data;

  const [flipped, setFlipped] = useState(0);
  // 'diario' | 'bilhetes' | 'cartas' | 'pergunta' | 'planos' | 'retro' | 'atualizacoes'
  const [view, setView] = useState('diario');
  const [modal, setModal] = useState(null); // 'gaveta' | 'calendario' | 'busca' | 'perfil'
  const [notesDate, setNotesDate] = useState(todayISO);
  const [bannerClosed, setBannerClosed] = useState(false);
  const [unseenUpdates, setUnseenUpdates] = useState(hasUnseenUpdates);

  const today = todayISO();
  const todayCount = notes.filter(n => n.note_date === today).length;
  const questionPending = !missing.cantinhos && !data.answers.some(a => a.question_date === today && a.user_id === me.id);
  const byId = useMemo(() => Object.fromEntries(profiles.map(p => [p.id, p])), [profiles]);
  const writeIndex = 2 + entries.length;

  // atalho: "/" ou Ctrl+K abre a busca
  useEffect(() => {
    const onKey = e => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setModal('busca');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const createEntry = useCallback(
    async values => {
      const { data: created, error } = await supabase.from('entries').insert(values).select('id').single();
      if (error) return error.message;
      const list = await load();
      const index = list.findIndex(e => e.id === created.id);
      if (index >= 0) setFlipped(leavesToShow(2 + index, single));
      return null;
    },
    [load, single]
  );

  const openEntry = useCallback(
    index => {
      setModal(null);
      setView('diario');
      setFlipped(leavesToShow(2 + index, single));
    },
    [single]
  );

  const openNotes = useCallback(date => {
    setModal(null);
    setNotesDate(date);
    setView('bilhetes');
  }, []);

  const pages = useMemo(() => {
    const list = [
      { key: 'capa', variant: 'cover', render: () => <CoverArt members={profiles} /> },
      {
        key: 'contracapa',
        variant: 'endpaper',
        render: () => (
          <InsideCover
            members={profiles}
            entriesCount={entries.length}
            firstDate={entries[0]?.entry_date}
            onEditProfile={() => setModal('perfil')}
            onLogout={() => supabase.auth.signOut()}
            notesToday={todayCount}
            onOpenNotes={() => setView('bilhetes')}
            togetherSince={settings.together_since}
            onSetTogetherSince={missing.settings ? null : saveTogetherSince}
          />
        )
      },
      ...entries.map((entry, i) => ({
        key: entry.id,
        variant: 'paper',
        render: () => <EntryPage entry={entry} author={byId[entry.author_id]} me={me} onChanged={load} pageNumber={i + 1} />
      })),
      {
        key: 'escrever',
        variant: 'paper',
        render: () => (
          <WritePage
            me={me}
            pageNumber={entries.length + 1}
            onCreate={createEntry}
            notesToday={todayCount}
            onOpenNotes={() => setView('bilhetes')}
          />
        )
      },
      { key: 'clima', variant: 'paper', render: () => <ThemePage theme={theme} onChange={setTheme} /> }
    ];
    if (!single) {
      if (list.length % 2 === 0) list.push({ key: 'continua', variant: 'paper', render: () => <EndNote /> });
      list.push({ key: 'contracapa-final', variant: 'backcover', render: () => <BackCover /> });
    }
    return list;
  }, [entries, profiles, byId, me, load, single, createEntry, theme, todayCount, settings, missing.settings, saveTogetherSince]);

  // 1 página por folha no celular, 2 no computador
  const limit = maxLeaves(pages.length, single);
  const latest = leavesToShow(writeIndex, single);
  const current = Math.min(flipped, limit);
  const flipTo = useCallback(n => setFlipped(Math.max(0, Math.min(limit, n))), [limit]);
  const isClosed = current === 0;

  const special = bannerClosed ? null : specialDay(settings.together_since, today);
  const backToDiary = () => setView('diario');
  const openGaveta = () => setModal('gaveta');
  const sectionProps = { me, profiles, onChanged: load, onBack: backToDiary, onGaveta: openGaveta };

  function pickFromGaveta(id) {
    setModal(null);
    if (id === 'busca') setModal('busca');
    else if (id === 'calendario') setModal('calendario');
    else if (id === 'bilhetes') openNotes(notesDate);
    else setView(id);
  }

  function pickSearchResult(go) {
    setModal(null);
    if (go.kind === 'entry') openEntry(go.index);
    else if (go.kind === 'notes') openNotes(go.date);
    else setView(go.kind);
  }

  return (
    <>
      {view === 'diario' && (special || data.countdowns.length > 0) && (
        <div className="desk-top-row">
          {special && (
            <div className="special-banner" role="status">
              <span>
                {special.kind === 'aniversario'
                  ? `💞 feliz ${special.years} ${special.years === 1 ? 'ano' : 'anos'} juntos!`
                  : `💞 feliz mesversário — ${special.months} ${special.months === 1 ? 'mês' : 'meses'} juntos!`}
              </span>
              <button className="link-btn tiny" onClick={() => setBannerClosed(true)} aria-label="fechar aviso">
                ✕
              </button>
            </div>
          )}
          <CountdownPill countdowns={data.countdowns} onOpen={() => setView('planos')} />
        </div>
      )}

      {view === 'bilhetes' && (
        <NotesBoard
          notes={notes}
          notesMissing={missing.notes}
          profiles={profiles}
          me={me}
          onChanged={load}
          onBack={backToDiary}
          onGaveta={openGaveta}
          date={notesDate}
          setDate={setNotesDate}
          onOpenCalendar={() => setModal('calendario')}
        />
      )}
      {view === 'cartas' && (
        <LettersView {...sectionProps} letters={data.letters} closedLetters={data.closedLetters} missing={missing.cantinhos} />
      )}
      {view === 'pergunta' && (
        <QuestionView {...sectionProps} answers={data.answers} answeredBy={data.answeredBy} missing={missing.cantinhos} />
      )}
      {view === 'planos' && (
        <PlansView {...sectionProps} wishlist={data.wishlist} countdowns={data.countdowns} missing={missing.cantinhos} />
      )}
      {view === 'retro' && (
        <RetroView {...sectionProps} entries={entries} notes={notes} wishlist={data.wishlist} answers={data.answers} onOpenEntry={openEntry} />
      )}
      {view === 'atualizacoes' && <UpdatesView onBack={backToDiary} onGaveta={openGaveta} onSeen={() => setUnseenUpdates(false)} />}

      {view === 'diario' && (
        <>
          <div className="book-stage">
            <Book pages={pages} flipped={current} onFlip={flipTo} onOpen={() => flipTo(latest)} single={single} />
          </div>

          <nav className="ribbon-nav" aria-label="navegação do diário">
            <button className="ribbon" onClick={() => flipTo(0)} disabled={isClosed}>
              {isClosed ? 'fechado' : 'fechar'}
            </button>
            <button className="ribbon round" onClick={() => flipTo(current - 1)} disabled={isClosed} aria-label="voltar">
              ‹
            </button>
            <button className="ribbon round next" onClick={() => flipTo(current + 1)} disabled={current >= limit} aria-label="avançar">
              ›
            </button>
            <button className="ribbon round cal" onClick={() => setModal('busca')} aria-label="buscar" title="buscar ( / )">
              🔍
            </button>
            <button className="ribbon gaveta-btn" onClick={openGaveta}>
              🗝️ gaveta
              {(unseenUpdates || data.closedLetters.length > 0 || questionPending) && <span className="ribbon-dot" aria-label="tem novidade" />}
            </button>
            <button className="ribbon accent" onClick={() => flipTo(latest)} disabled={current === latest}>
              escrever ✏️
            </button>
          </nav>
        </>
      )}

      {modal === 'gaveta' && (
        <Gaveta
          onClose={() => setModal(null)}
          onPick={pickFromGaveta}
          badges={{
            notesToday: todayCount || null,
            closedLetters: data.closedLetters.length || null,
            questionPending,
            updates: unseenUpdates
          }}
        />
      )}

      {modal === 'busca' && (
        <SearchModal
          entries={entries}
          notes={notes}
          letters={data.letters}
          answers={data.answers}
          wishlist={data.wishlist}
          onClose={() => setModal(null)}
          onPick={pickSearchResult}
        />
      )}

      {modal === 'calendario' && (
        <Calendar
          entries={entries}
          notes={notes}
          togetherSince={settings.together_since}
          startDate={view === 'bilhetes' ? notesDate : undefined}
          onClose={() => setModal(null)}
          onOpenEntry={openEntry}
          onOpenNotes={openNotes}
        />
      )}

      {modal === 'perfil' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()}>
            <ProfileSetup
              userId={me.id}
              initial={me}
              onCancel={() => setModal(null)}
              onDone={() => {
                setModal(null);
                onProfileChange();
                load();
              }}
            />
          </div>
        </div>
      )}

      <Toasts />
    </>
  );
}

function Toasts() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map(t => (
        <button key={t.id} className="toast" onClick={() => dismissToast(t.id)}>
          <strong>{t.title}</strong>
          {t.body && <span>{t.body}</span>}
        </button>
      ))}
    </div>
  );
}
