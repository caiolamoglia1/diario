import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EntryFoot, EntryLayout } from './pages';

/*
 * Página longa vira várias páginas, como num livro de verdade.
 *
 * Rolar dentro de uma folha em 3D não funciona direito (o navegador rola a mesa
 * em vez da página), então o texto é medido numa página invisível do mesmo tamanho
 * e cortado entre palavras onde a página acaba. Mede de novo quando muda o texto,
 * o tamanho da tela, o tema ou quando as fontes terminam de carregar.
 */

const VARIANTS = [
  ['fl', 0, true], // primeira e última
  ['fn', 0, false], // primeira, continua
  ['cl', 1, true], // continuação e última
  ['cn', 1, false] // continuação, continua
];

/** devolve { [entryId]: string[] } e o medidor (para renderizar escondido enquanto mede) */
export function useEntryPages(entries, byId, meId, single, theme) {
  const [env, setEnv] = useState(0);

  useEffect(() => {
    let timer = 0;
    const bump = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setEnv(n => n + 1), 150);
    };
    window.addEventListener('resize', bump);
    document.fonts?.ready.then(bump);
    document.fonts?.addEventListener?.('loadingdone', bump);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', bump);
      document.fonts?.removeEventListener?.('loadingdone', bump);
    };
  }, []);

  const sig = useMemo(
    () =>
      JSON.stringify([
        single,
        theme,
        env,
        meId,
        entries.map(e => [e.id, e.content, e.title, e.entry_date, Boolean(e.photo_path), e.mood, e.reactions?.length, byId[e.author_id]?.name])
      ]),
    [entries, byId, meId, single, theme, env]
  );

  const [result, setResult] = useState({ sig: null, chunks: {} });

  const measurer =
    result.sig === sig ? null : (
      <Measurer key={sig} entries={entries} byId={byId} meId={meId} single={single} onDone={chunks => setResult({ sig, chunks })} />
    );

  return [result.chunks, measurer];
}

function Measurer({ entries, byId, meId, single, onDone }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const chunks = {};
    [...ref.current.children].forEach((box, i) => {
      const entry = entries[i];
      const pick = v => {
        const inner = box.querySelector(`[data-v="${v}"] .page-inner`);
        return { inner, body: inner.querySelector('.entry-body') };
      };
      chunks[entry.id] = splitText(entry.content ?? '', pick('fl'), pick('fn'), pick('cl'), pick('cn'));
    });
    onDone(chunks);
    // mede uma vez por montagem (a key muda quando algo muda)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="book-stage page-measurer" aria-hidden="true">
      <div className={`book ${single ? 'single' : 'double'}`} ref={ref}>
        {entries.map(entry => (
          <div key={entry.id}>
            {VARIANTS.map(([v, part, last]) => (
              <div className="leaf" data-v={v} key={v}>
                <div className="face front paper">
                  <EntryLayout
                    entry={entry}
                    author={byId[entry.author_id]}
                    part={part}
                    last={last}
                    text=""
                    pageNumber={1}
                    photo={entry.photo_path ? <figure className="taped-photo entry-photo" /> : null}
                    foot={<EntryFoot entry={entry} meId={meId} />}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function fits(layout, text) {
  layout.body.textContent = text;
  return layout.inner.scrollHeight <= layout.inner.clientHeight + 1;
}

/** maior n em [lo, hi] com ok(n) verdadeiro (ok é monotônico); lo - 1 se nenhum */
function largest(lo, hi, ok) {
  let best = lo - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (ok(mid)) {
      best = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return best;
}

function splitText(text, firstLast, firstMore, contLast, contMore) {
  // página sem tamanho (ainda escondida/sem layout): não arrisca cortar
  if (firstLast.inner.clientHeight < 60) return [text];

  const out = [];
  let rest = text.replace(/\s+$/, '');
  let first = true;

  while (out.length < 200) {
    if (fits(first ? firstLast : contLast, rest)) {
      out.push(rest);
      return out;
    }
    const layout = first ? firstMore : contMore;

    // pontos de corte: entre palavras
    const cuts = [];
    const re = /\s+/g;
    let m;
    while ((m = re.exec(rest))) if (m.index > 0) cuts.push([m.index, m.index + m[0].length]);

    const k = largest(0, cuts.length - 1, i => fits(layout, rest.slice(0, cuts[i][0])));
    if (k >= 0) {
      out.push(rest.slice(0, cuts[k][0]));
      rest = rest.slice(cuts[k][1]);
    } else if (first) {
      // cabeçalho + foto já enchem a primeira página: o texto começa na próxima
      out.push('');
    } else {
      // uma "palavra" enorme (link, kkkkkk…): corta no meio mesmo
      const n = Math.max(1, largest(1, rest.length, i => fits(layout, rest.slice(0, i))));
      out.push(rest.slice(0, n));
      rest = rest.slice(n);
    }
    first = false;
    if (!rest) return out;
  }
  out.push(rest);
  return out;
}
