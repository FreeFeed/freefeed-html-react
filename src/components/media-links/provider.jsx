import { useMemo } from 'react';
import { mediaLinksContext as ctx } from './helpers';

export function MediaLinksProvider({ children }) {
  const list = useMemo(() => [], []);
  return <ctx.Provider value={list}>{children}</ctx.Provider>;
}
