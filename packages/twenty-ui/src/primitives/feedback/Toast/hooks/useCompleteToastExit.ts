import { useCallback } from 'react';

import { type ToastEntry } from '../types/ToastEntry';
import { useToastContext } from './useToastContext';

export const useCompleteToastExit = () => {
  const store = useToastContext();

  const completeToastExit = useCallback(
    (toast: ToastEntry) => {
      const { toasts } = store.state;
      const isCurrentClosingToast =
        toast.status === 'closing' && toasts.includes(toast);

      if (!isCurrentClosingToast) {
        return;
      }

      store.set(
        'toasts',
        toasts.filter((currentToast) => currentToast !== toast),
      );
    },
    [store],
  );

  return { completeToastExit };
};
