import { useCallback } from 'react';

import { toastState } from '../states/toastState';
import { type ToastEntry } from '../types/ToastEntry';
import { type ToastState } from '../types/ToastState';
import { isVisibleToast } from '../utils/isVisibleToast';
import { useToastContext } from './useToastContext';

export const useDismissToasts = () => {
  const store = useToastContext();

  const dismissToasts = useCallback(
    ({
      toastsToClose,
      nextState = store.get(toastState),
    }: {
      toastsToClose: ToastEntry[];
      nextState?: ToastState;
    }) => {
      const toasts = nextState.toasts.map(
        (toast): ToastEntry =>
          toastsToClose.includes(toast)
            ? { ...toast, status: 'closing' }
            : toast,
      );

      store.set(toastState, {
        ...nextState,
        toasts: nextState.isToasterMounted
          ? toasts
          : toasts.filter(isVisibleToast),
      });
      toastsToClose.forEach((toast) => toast.notification.onClose?.());
    },
    [store],
  );

  return { dismissToasts };
};
