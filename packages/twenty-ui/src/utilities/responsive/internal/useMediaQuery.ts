import { isFunction } from '@sniptt/guards';
import { useMemo, useSyncExternalStore } from 'react';

const getServerSnapshot = () => false;

export const useMediaQuery = (query: string) => {
  const store = useMemo(() => {
    const mediaQueryList =
      typeof window !== 'undefined' && isFunction(window.matchMedia)
        ? window.matchMedia(query)
        : undefined;

    return {
      getSnapshot: () => mediaQueryList?.matches ?? false,
      subscribe: (onStoreChange: () => void) => {
        mediaQueryList?.addEventListener('change', onStoreChange);

        return () =>
          mediaQueryList?.removeEventListener('change', onStoreChange);
      },
    };
  }, [query]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getServerSnapshot,
  );
};
