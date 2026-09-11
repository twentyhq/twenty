import { useCallback } from 'react';

import { toastState } from '../states/toastState';
import { type ToastEntry } from '../types/ToastEntry';
import { useToastContext } from './useToastContext';

export const useCompleteToastExit = () => {
  const store = useToastContext();

  const completeToastExit = useCallback(
    (toast: ToastEntry) => {
      const state = store.get(toastState);
      const isCurrentClosingToast =
        toast.status === 'closing' && state.toasts.includes(toast);

      if (!isCurrentClosingToast) {
        return;
      }

      store.set(toastState, {
        ...state,
        toasts: state.toasts.filter((currentToast) => currentToast !== toast),
      });
    },
    [store],
  );

  return { completeToastExit };
};
