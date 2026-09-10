import { createStore } from 'jotai';
import { useState } from 'react';

import { DEFAULT_TOAST_LIMIT, toastStateAtom } from './internal/toastAtoms';
import { ToastContext } from './internal/ToastContext';
import { type ToastProviderProps } from './types/ToastProviderProps';

export const ToastProvider = ({
  children,
  limit = DEFAULT_TOAST_LIMIT,
}: ToastProviderProps) => {
  const [store] = useState(() => {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error('Toast limit must be a positive integer.');
    }

    const toastStore = createStore();
    toastStore.set(toastStateAtom, (state) => ({ ...state, limit }));
    return toastStore;
  });

  return (
    <ToastContext.Provider value={store}>{children}</ToastContext.Provider>
  );
};
