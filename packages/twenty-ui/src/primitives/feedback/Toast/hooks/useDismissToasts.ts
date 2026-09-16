import { useCallback } from 'react';

import { type ToastEntry } from '../types/ToastEntry';
import { isToastVisible } from '../utils/isToastVisible';
import { useToastContext } from './useToastContext';

export const useDismissToasts = () => {
  const store = useToastContext();

  const dismissToasts = useCallback(
    ({
      toastsToClose,
      nextToasts = store.state.toasts,
    }: {
      toastsToClose: ToastEntry[];
      nextToasts?: ToastEntry[];
    }) => {
      const toasts = nextToasts.map(
        (toast): ToastEntry =>
          toastsToClose.includes(toast)
            ? { ...toast, status: 'closing' }
            : toast,
      );

      const isToasterMounted = store.state.mountedToasterCount > 0;

      store.set(
        'toasts',
        isToasterMounted ? toasts : toasts.filter(isToastVisible),
      );

      for (const toast of toastsToClose) {
        toast.notification.onClose?.();
      }
    },
    [store],
  );

  return { dismissToasts };
};
