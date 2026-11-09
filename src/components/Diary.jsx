import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import Book from './Book';
import { leavesToShow, maxLeaves, useSinglePage } from '../lib/book';
import { BackCover, CoverArt, EndNote, EntryPage, InsideCover, ThemePage, WritePage } from './pages';
import { setTheme, useTheme } from '../lib/theme';
import ProfileSetup from './ProfileSetup';

export default function Diary({ me, onProfileChange }) {
  const single = useSinglePage();
  const theme = useTheme();
  const [profiles, setProfiles] = useState([me]);
  const [entries, setEntries] = useState([]);
  const [flipped, setFlipped] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);

  const load = useCallback(async () => {
    const [p, e] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase
        .from('entries')
        .select('*, reactions(*)')
        .order('entry_date', { ascending: true })
        .order('created_at', { ascending: true })
    ]);
    if (!p.error) setProfiles(p.data);
    if (!e.error) setEntries(e.data);
    return e.data ?? [];
  }, []);

  // carga inicial + tempo real (o que o outro escreve aparece na hora)
  const reloadTimer = useRef(0);
  useEffect(() => {
    load();
    const channel = supabase
      .channel('diario')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        clearTimeout(reloadTimer.current);
        reloadTimer.current = setTimeout(load, 250);
      })
      .subscribe();
    return () => {
      clearTimeout(reloadTimer.current);
      supabase.removeChannel(channel);
    };
  }, [load]);

  const byId = useMemo(() => Object.fromEntries(profiles.map(p => [p.id, p])), [profiles]);
  const writeIndex = 2 + entries.length;

  const createEntry = useCallback(
    async values => {
      const { data, error } = await supabase.from('entries').insert(values).select('id').single();
      if (error) return error.message;
      const list = await load();
      const index = list.findIndex(e => e.id === data.id);
      if (index >= 0) setFlipped(leavesToShow(2 + index, single));
      return null;
    },
    [load, single]
  );

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
            onEditProfile={() => setEditingProfile(true)}
            onLogout={() => supabase.auth.signOut()}
          />
        )
      },
      ...entries.map((entry, i) => ({
        key: entry.id,
        variant: 'paper',
        render: () => (
          <EntryPage entry={entry} author={byId[entry.author_id]} me={me} onChanged={load} pageNumber={i + 1} />
        )
      })),
      {
        key: 'escrever',
        variant: 'paper',
        render: () => (
          <WritePage me={me} pageNumber={entries.length + 1} onCreate={createEntry} />
        )
      },
      { key: 'clima', variant: 'paper', render: () => <ThemePage theme={theme} onChange={setTheme} /> }
    ];
    if (!single) {
      if (list.length % 2 === 0) list.push({ key: 'continua', variant: 'paper', render: () => <EndNote /> });
      list.push({ key: 'contracapa-final', variant: 'backcover', render: () => <BackCover /> });
    }
    return list;
  }, [entries, profiles, byId, me, load, single, createEntry, theme]);

  // 1 página por folha no celular, 2 no computador
  const limit = maxLeaves(pages.length, single);
  const latest = leavesToShow(writeIndex, single);
  const current = Math.min(flipped, limit);
  const flipTo = useCallback(n => setFlipped(Math.max(0, Math.min(limit, n))), [limit]);
  const isClosed = current === 0;

  return (
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
        <button
          className="ribbon round next"
          onClick={() => flipTo(current + 1)}
          disabled={current >= limit}
          aria-label="avançar"
        >
          ›
        </button>
        <button className="ribbon accent" onClick={() => flipTo(latest)} disabled={current === latest}>
          escrever ✏️
        </button>
      </nav>

      {editingProfile && (
        <div className="modal-backdrop" onClick={() => setEditingProfile(false)}>
          <div onClick={e => e.stopPropagation()}>
            <ProfileSetup
              userId={me.id}
              initial={me}
              onCancel={() => setEditingProfile(false)}
              onDone={() => {
                setEditingProfile(false);
                onProfileChange();
                load();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
