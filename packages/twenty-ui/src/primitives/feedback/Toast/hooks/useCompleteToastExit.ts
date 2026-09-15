import { useCallback } from 'react';

import { toastsState } from '../states/toastsState';
import { type ToastEntry } from '../types/ToastEntry';
import { useToastContext } from './useToastContext';

export const useCompleteToastExit = () => {
  const store = useToastContext();

  const completeToastExit = useCallback(
    (toast: ToastEntry) => {
      const toasts = store.get(toastsState);
      const isCurrentClosingToast =
        toast.status === 'closing' && toasts.includes(toast);

      if (!isCurrentClosingToast) {
        return;
      }

      store.set(
        toastsState,
        toasts.filter((currentToast) => currentToast !== toast),
      );
    },
    [store],
  );

  return { completeToastExit };
};
