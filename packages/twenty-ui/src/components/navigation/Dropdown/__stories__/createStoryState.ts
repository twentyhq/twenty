import { useSyncExternalStore } from 'react';

export const createStoryState = <TValue>(initialValue: TValue) => {
  let value = initialValue;
  const listeners = new Set<() => void>();

  const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  return {
    set: (nextValue: TValue) => {
      value = nextValue;

      for (const listener of listeners) {
        listener();
      }
    },
    useValue: () => {
      return useSyncExternalStore(subscribe, () => value);
    },
  };
};
