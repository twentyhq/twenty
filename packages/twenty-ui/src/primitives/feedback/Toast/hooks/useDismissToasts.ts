import { useCallback } from 'react';

import { mountedToasterCountState } from '../states/mountedToasterCountState';
import { toastsState } from '../states/toastsState';
import { type ToastEntry } from '../types/ToastEntry';
import { isToastVisible } from '../utils/isToastVisible';
import { useToastContext } from './useToastContext';

export const useDismissToasts = () => {
  const store = useToastContext();

  const dismissToasts = useCallback(
    ({
      toastsToClose,
      nextToasts = store.get(toastsState),
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

      const isToasterMounted = store.get(mountedToasterCountState) > 0;

      store.set(
        toastsState,
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
