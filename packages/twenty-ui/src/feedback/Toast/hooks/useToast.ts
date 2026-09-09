import { useMemo } from 'react';

import { useToastContext } from '../internal/useToastContext';
import { type ToastOptions } from '../types/ToastOptions';

export const useToast = () => {
  const { store, limit } = useToastContext();

  return useMemo(
    () => ({
      add: (options: ToastOptions) => store.add(options, limit),
      close: store.close,
    }),
    [store, limit],
  );
};
