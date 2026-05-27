'use client';

import { createContext, useMemo, useState, type ReactNode } from 'react';

type WindowOrderApi = {
  register: (id: string) => void;
  unregister: (id: string) => void;
  activate: (id: string) => void;
};

export const WindowOrderApiContext = createContext<WindowOrderApi | null>(null);
export const WindowOrderStackContext = createContext<ReadonlyArray<string>>([]);

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
