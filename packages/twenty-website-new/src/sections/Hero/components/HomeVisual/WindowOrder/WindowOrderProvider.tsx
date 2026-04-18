'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

// Z-order manager for the hero's floating windows. Each window registers on
// mount and can call `activate()` to jump to the front on click. The provider
// keeps a stack (first = back, last = front); z-indexes start at 2 so floating
// windows always sit above the static scene.
//
// Split into two contexts on purpose:
// - `Api`   — stable callbacks (never changes identity) so `useEffect` in the
//             consumer only runs on mount / unmount.
// - `Stack` — the reactive ordering; changes every activate, consumers
//             derive their z-index from it.
// Without this split, `useEffect(() => context.register(id), [context])`
// would unregister and re-register on every activate call (because the
// memoized value reference changes), causing stack churn.

type WindowOrderApi = {
  register: (id: string) => void;
  unregister: (id: string) => void;
  activate: (id: string) => void;
};

const WindowOrderApiContext = createContext<WindowOrderApi | null>(null);
const WindowOrderStackContext = createContext<ReadonlyArray<string>>([]);

export const WindowOrderProvider = ({ children }: { children: ReactNode }) => {
  const [stack, setStack] = useState<string[]>([]);

  const api = useMemo<WindowOrderApi>(
    () => ({
      register: (id) =>
        setStack((previous) =>
          previous.includes(id) ? previous : [...previous, id],
        ),
      unregister: (id) =>
        setStack((previous) => previous.filter((item) => item !== id)),
      activate: (id) =>
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
    <WindowOrderApiContext.Provider value={api}>
      <WindowOrderStackContext.Provider value={stack}>
        {children}
      </WindowOrderStackContext.Provider>
    </WindowOrderApiContext.Provider>
  );
};

export const useWindowOrder = (id: string) => {
  const api = useContext(WindowOrderApiContext);
  const stack = useContext(WindowOrderStackContext);

  useEffect(() => {
    if (!api) {
      return undefined;
    }
    api.register(id);
    return () => {
      api.unregister(id);
    };
  }, [api, id]);

  const zIndex = useMemo(() => {
    const index = stack.indexOf(id);
    return index === -1 ? 1 : index + 2;
  }, [stack, id]);

  const activate = useCallback(() => {
    api?.activate(id);
  }, [api, id]);

  return { activate, zIndex };
};
