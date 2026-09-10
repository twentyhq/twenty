import { isNonEmptyArray } from '@sniptt/guards';
import { atom } from 'jotai';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ToastOptions } from '../types/ToastOptions';
import { type ToastEntry } from './ToastEntry';

export const DEFAULT_TOAST_LIMIT = 3;

type ToastState = {
  toasts: ToastEntry[];
  nextRenderKey: number;
  limit: number;
  isToasterMounted: boolean;
};

const isVisibleToast = (toast: ToastEntry) => toast.status === 'visible';

export const toastStateAtom = atom<ToastState>({
  toasts: [],
  nextRenderKey: 0,
  limit: DEFAULT_TOAST_LIMIT,
  isToasterMounted: false,
});

// Only mounted viewports subscribe; without one, exit animations cannot finish.
toastStateAtom.onMount = (setState) => {
  setState((state) => ({ ...state, isToasterMounted: true }));

  return () => {
    setState((state) => ({
      ...state,
      isToasterMounted: false,
      toasts: state.toasts.filter(isVisibleToast),
    }));
  };
};

const dismissToastsAtom = atom(
  null,
  (
    get,
    set,
    {
      toastsToClose,
      nextState = get(toastStateAtom),
    }: {
      toastsToClose: ToastEntry[];
      nextState?: ToastState;
    },
  ) => {
    const toasts = nextState.toasts.map(
      (toast): ToastEntry =>
        toastsToClose.includes(toast) ? { ...toast, status: 'closing' } : toast,
    );

    set(toastStateAtom, {
      ...nextState,
      toasts: nextState.isToasterMounted
        ? toasts
        : toasts.filter(isVisibleToast),
    });
    toastsToClose.forEach((toast) => toast.notification.onClose?.());
  },
);

export const enqueueToastAtom = atom(
  null,
  (get, set, options: ToastOptions | undefined) => {
    if (!isDefined(options)) {
      return;
    }

    const state = get(toastStateAtom);
    const visibleToasts = state.toasts.filter(isVisibleToast);
    const existingToast = visibleToasts.find(
      ({ notification }) =>
        (isDefined(options.dedupeKey) &&
          notification.dedupeKey === options.dedupeKey) ||
        (isDefined(options.id) && notification.id === options.id),
    );

    if (isDefined(existingToast)) {
      return existingToast.notification.id;
    }

    const id =
      options.id ??
      `toast-${crypto.getRandomValues(new Uint32Array(4)).join('-')}`;
    const removedCount = Math.max(0, visibleToasts.length - state.limit + 1);

    set(dismissToastsAtom, {
      toastsToClose: visibleToasts.slice(0, removedCount),
      nextState: {
        ...state,
        nextRenderKey: state.nextRenderKey + 1,
        toasts: [
          ...state.toasts.filter((toast) => toast.notification.id !== id),
          {
            notification: { ...options, id },
            status: 'visible',
            renderKey: state.nextRenderKey,
          },
        ],
      },
    });

    return id;
  },
);

export const closeToastAtom = atom(null, (get, set, id?: string) => {
  const toastsToClose = get(toastStateAtom).toasts.filter(
    (toast) =>
      isVisibleToast(toast) && (!isDefined(id) || toast.notification.id === id),
  );

  if (!isNonEmptyArray(toastsToClose)) {
    return;
  }

  set(dismissToastsAtom, { toastsToClose });
});

export const completeToastExitAtom = atom(
  null,
  (get, set, toast: ToastEntry) => {
    const state = get(toastStateAtom);
    const isCurrentClosingToast =
      toast.status === 'closing' && state.toasts.includes(toast);

    if (!isCurrentClosingToast) {
      return;
    }

    set(toastStateAtom, {
      ...state,
      toasts: state.toasts.filter((currentToast) => currentToast !== toast),
    });
  },
);
