import { useMemo, useState } from 'react';

import { createToastStore } from './internal/createToastStore';
import { ToastContext } from './internal/ToastContext';
import { type ToastProviderProps } from './types/ToastProviderProps';

export const ToastProvider = ({ children, limit = 3 }: ToastProviderProps) => {
  const [store] = useState(createToastStore);
  const context = useMemo(() => ({ store, limit }), [store, limit]);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('ToastProvider limit must be a positive integer.');
  }

  return (
    <ToastContext.Provider value={context}>{children}</ToastContext.Provider>
  );
};
