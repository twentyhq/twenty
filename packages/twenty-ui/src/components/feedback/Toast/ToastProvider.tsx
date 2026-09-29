import { useState } from 'react';

import { DEFAULT_TOAST_LIMIT } from './internal/constants/DefaultToastLimit';
import { ToastContext } from './internal/contexts/ToastContext';
import { createToastStore } from './internal/stores/createToastStore';
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
