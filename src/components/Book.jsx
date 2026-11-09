import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { maxLeaves } from '../lib/book';

const FLIP_MS = 900;
const MAX_FAN_MS = 700;
function Face({ page, side, live }) {
  const variant = page?.variant ?? 'paper';
  return (
    <div className={`face ${side} ${variant}`}>
      {live && page ? page.render() : null}
    </div>
  );
}

/**
 * Livro com folhas que viram em 3D.
 * pages: [{ key, variant: 'cover' | 'endpaper' | 'paper' | 'back', render: () => node }]
 * flipped: quantas folhas estão viradas (0 = fechado)
 */
export default function Book({ pages, flipped, onFlip, onOpen, single }) {
  const leaves = useMemo(() => {
    if (single) {
      return pages.map(p => ({
        key: p.key,
        front: p,
        back: { key: `${p.key}-verso`, variant: p.variant === 'cover' ? 'endpaper' : 'paper', render: () => null }
      }));
    }
    const out = [];
    for (let i = 0; i < pages.length; i += 2) out.push({ key: pages[i].key, front: pages[i], back: pages[i + 1] });
    return out;
  }, [pages, single]);

  const total = leaves.length;
  const [turning, setTurning] = useState({ map: {}, step: 0 });
  const previous = useRef(flipped);

  // Antes de pintar: marca as folhas que estão virando para ficarem por cima.
  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = flipped;
    if (from === flipped) return undefined;
    const forward = flipped > from;
    const lo = Math.min(from, flipped);
    const hi = Math.max(from, flipped);
    const count = hi - lo;
    const step = count > 1 ? Math.min(70, MAX_FAN_MS / count) : 0;
    const map = {};
    for (let i = lo; i < hi; i++) map[i] = forward ? i - lo : hi - 1 - i;
    setTurning({ map, step });
    const timer = setTimeout(() => setTurning({ map: {}, step: 0 }), FLIP_MS + step * count + 60);
    return () => clearTimeout(timer);
  }, [flipped]);

  // Teclado
  useEffect(() => {
    const onKey = e => {
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight') onFlip(flipped + 1);
      if (e.key === 'ArrowLeft') onFlip(flipped - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipped, onFlip]);

  // Arrastar para virar: a folha acompanha o mouse/dedo e completa (ou volta) ao soltar
  const bookRef = useRef(null);
  const gesture = useRef(null);
  const swallowClick = useRef(false);
  const [drag, setDrag] = useState(null); // { leaf, angle }

  const onPointerDown = e => {
    swallowClick.current = false;
    if (e.button !== 0 || e.target.closest('input, textarea, button, select, a, label')) return;
    gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId, active: false };
  };

  const onPointerMove = e => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.id) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.active) {
      if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) {
        gesture.current = null; // rolando o texto, não virando
        return;
      }
      if (Math.abs(dx) < 8) return;
      const rect = bookRef.current.getBoundingClientRect();
      const pageW = single ? rect.width : rect.width / 2;
      const spine = single ? rect.left : rect.left + pageW;
      const forward = single ? dx < 0 : g.x > spine;
      const leaf = forward ? flipped : flipped - 1;
      const lastLeaf = single ? total - 2 : total - 1;
      if (leaf < 0 || leaf > lastLeaf) {
        gesture.current = null;
        return;
      }
      Object.assign(g, { active: true, forward, leaf, spine, pageW, rest: forward ? spine + pageW : spine - pageW });
      bookRef.current.setPointerCapture?.(e.pointerId);
    }
    // a borda da folha segue o ponteiro (um pouco acelerada para não precisar arrastar até a ponta)
    const edge = g.rest + dx * 1.6;
    const cos = Math.max(-1, Math.min(1, (edge - g.spine) / g.pageW));
    g.theta = (Math.acos(cos) * 180) / Math.PI;
    setDrag({ leaf: g.leaf, angle: -g.theta });
  };

  const endDrag = (e, cancelled) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.active) return;
    swallowClick.current = true;
    bookRef.current.releasePointerCapture?.(e.pointerId);
    setDrag(null);
    if (cancelled) return;
    if (g.forward && g.theta > 70) onFlip(flipped + 1);
    if (!g.forward && g.theta < 110) onFlip(flipped - 1);
  };

  const onClickCapture = e => {
    if (swallowClick.current) {
      swallowClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const closed = flipped === 0;
  const atEnd = !single && flipped === total;
  const shift = single ? 0 : closed ? -25 : atEnd ? 25 : 0;

  return (
    <div
      ref={bookRef}
      className={`book ${single ? 'single' : 'double'}${closed ? ' closed' : ''}${drag ? ' is-dragging' : ''}`}
      style={{ transform: `translateX(${shift}%)` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={e => endDrag(e, false)}
      onPointerCancel={e => endDrag(e, true)}
      onClickCapture={onClickCapture}
    >
      {!single && flipped > 0 && <div className="page-block left" />}
      {flipped < total && <div className={`page-block right${closed ? ' under-cover' : ''}`} />}
      <Bookmarks />

      {leaves.map((leaf, i) => {
        const isFlipped = i < flipped;
        const order = turning.map[i];
        const isTurning = order !== undefined;
        const isDragged = drag?.leaf === i;
        const near = isTurning || isDragged || Math.abs(i - flipped) <= 1 || i === flipped - 2;
        const style = {
          zIndex: isDragged ? total + 50 : isTurning ? total + 10 + order : isFlipped ? i : total - i,
          transitionDelay: isTurning ? `${order * turning.step}ms` : '0ms',
          '--delay': isTurning ? `${order * turning.step}ms` : '0ms',
          cursor: i === 0 && closed ? 'pointer' : undefined
        };
        if (isDragged) {
          style.transform = `rotateY(${drag.angle}deg)`;
          style.transitionDuration = '0s';
          style['--shade'] = Math.sin((-drag.angle * Math.PI) / 180).toFixed(3);
        }
        return (
          <div
            key={leaf.key}
            className={`leaf${isFlipped ? ' flipped' : ''}${isTurning ? ' turning' : ''}${isDragged ? ' dragging' : ''}`}
            style={style}
            onClick={i === 0 && closed ? () => (onOpen ? onOpen() : onFlip(1)) : undefined}
          >
            <Face page={leaf.front} side="front" live={near} />
            <Face page={leaf.back} side="back" live={near && !single} />
          </div>
        );
      })}

      {!closed && (
        <button className="corner prev" onClick={() => onFlip(flipped - 1)} aria-label="página anterior">
          <span>‹</span>
        </button>
      )}
      {flipped < maxLeaves(pages.length, single) && !closed && (
        <button className="corner next" onClick={() => onFlip(flipped + 1)} aria-label="próxima página">
          <span>›</span>
        </button>
      )}
    </div>
  );
}

/** fitinhas marca-página saindo por baixo, na lombada */
export function Bookmarks() {
  return (
    <div className="bookmarks" aria-hidden="true">
      <span className="bm pink" />
      <span className="bm lilac" />
      <span className="bm blue" />
    </div>
  );
}
