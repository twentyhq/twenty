import { isPositiveInteger } from '@sniptt/guards';
import { createStore } from 'jotai';
import { useState } from 'react';

import { DEFAULT_TOAST_LIMIT } from './constants/DefaultToastLimit';
import { ToastContext } from './contexts/ToastContext';
import { toastLimitState } from './states/toastLimitState';
import { type ToastProviderProps } from './types/ToastProviderProps';

export const ToastProvider = ({
  children,
  limit = DEFAULT_TOAST_LIMIT,
}: ToastProviderProps) => {
  const [store] = useState(() => {
    if (!isPositiveInteger(limit)) {
      throw new Error('Toast limit must be a positive integer.');
    }

    const toastStore = createStore();
    toastStore.set(toastLimitState, limit);
    return toastStore;
  });

  return (
    <ToastContext.Provider value={store}>{children}</ToastContext.Provider>
  );
};
