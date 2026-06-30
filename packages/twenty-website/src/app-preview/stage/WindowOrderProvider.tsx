'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { WINDOW_ORDER_CONTEXTS } from './window-order-contexts';

// The desktop's z-order: last-activated window sits on top.
export function WindowOrderProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<string[]>([]);
  const api = useMemo(
    () => ({
      register: (id: string) =>
        setStack((previous) =>
          previous.includes(id) ? previous : [...previous, id],
        ),
      unregister: (id: string) =>
        setStack((previous) => previous.filter((item) => item !== id)),
      activate: (id: string) =>
        setStack((previous) => {
          if (previous[previous.length - 1] === id) {
            return previous;
          }
          return [...previous.filter((item) => item !== id), id];
        }),
    }),
    [],
  );

  return (
    <WINDOW_ORDER_CONTEXTS.api.Provider value={api}>
      <WINDOW_ORDER_CONTEXTS.stack.Provider value={stack}>
        {children}
      </WINDOW_ORDER_CONTEXTS.stack.Provider>
    </WINDOW_ORDER_CONTEXTS.api.Provider>
  );
}
