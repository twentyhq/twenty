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
