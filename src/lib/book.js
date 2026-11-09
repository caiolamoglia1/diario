import { useEffect, useState } from 'react';

const SINGLE_QUERY = '(max-width: 760px)';

/** true em telas estreitas: o livro mostra uma página por vez */
export function useSinglePage() {
  const [single, setSingle] = useState(() => window.matchMedia(SINGLE_QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(SINGLE_QUERY);
    const onChange = () => setSingle(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return single;
}

/** quantas folhas precisam estar viradas para a página `index` ficar visível */
export function leavesToShow(index, single) {
  return single ? index : Math.ceil(index / 2);
}

export function maxLeaves(pageCount, single) {
  return single ? pageCount - 1 : Math.ceil(pageCount / 2);
}
