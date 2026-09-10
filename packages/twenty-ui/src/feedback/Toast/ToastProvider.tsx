import { useState } from 'react';

import { createToastStore } from './internal/createToastStore';
import { ToastContext } from './internal/ToastContext';
import { type ToastProviderProps } from './types/ToastProviderProps';

export const ToastProvider = ({ children, limit }: ToastProviderProps) => {
  const [store] = useState(() => createToastStore({ limit }));

  return (
    <ToastContext.Provider value={store}>{children}</ToastContext.Provider>
  );
};
