import { useState } from 'react';

import { DEFAULT_TOAST_LIMIT } from './internal/DefaultToastLimit';
import { ToastContext } from './internal/ToastContext';
import { createToastStore } from './internal/createToastStore';
import { type ToastProviderProps } from './types/ToastProviderProps';

export const ToastProvider = ({
  children,
  limit = DEFAULT_TOAST_LIMIT,
}: ToastProviderProps) => {
  const [store] = useState(() => createToastStore(limit));

  return (
    <ToastContext.Provider value={store}>{children}</ToastContext.Provider>
  );
};
