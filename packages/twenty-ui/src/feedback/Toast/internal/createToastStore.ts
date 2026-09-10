import { isNonEmptyArray } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ToastOptions } from '../types/ToastOptions';
import { type ToastEntry } from './ToastEntry';

const DEFAULT_TOAST_LIMIT = 3;

type CreateToastStoreParams = {
  limit?: number;
};

const isVisibleToast = (toast: ToastEntry) => toast.status === 'visible';

export const createToastStore = ({
  limit = DEFAULT_TOAST_LIMIT,
}: CreateToastStoreParams = {}) => {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('Toast limit must be a positive integer.');
  }

  const emptyToasts: ToastEntry[] = [];
  let toasts = emptyToasts;
  let nextRenderKey = 0;
  const listeners = new Set<() => void>();

  const hasViewportToAnimateExits = () => listeners.size > 0;

  const publish = (nextToasts: ToastEntry[]) => {
    toasts = hasViewportToAnimateExits()
      ? nextToasts
      : nextToasts.filter(isVisibleToast);
    listeners.forEach((listener) => listener());
  };

  const dismiss = ({
    toastsToClose,
    nextToasts = toasts,
  }: {
    toastsToClose: ToastEntry[];
    nextToasts?: ToastEntry[];
  }) => {
    publish(
      nextToasts.map((toast) =>
        toastsToClose.includes(toast) ? { ...toast, status: 'closing' } : toast,
      ),
    );
    toastsToClose.forEach((toast) => toast.notification.onClose?.());
  };

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!hasViewportToAnimateExits()) {
          publish(toasts);
        }
      };
    },
    getSnapshot: () => toasts,
    getServerSnapshot: () => emptyToasts,
    enqueueToast: (options: ToastOptions) => {
      const visibleToasts = toasts.filter(isVisibleToast);
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
      const renderKey = nextRenderKey;
      nextRenderKey += 1;
      const removedCount = Math.max(0, visibleToasts.length - limit + 1);
      dismiss({
        toastsToClose: visibleToasts.slice(0, removedCount),
        nextToasts: [
          ...toasts.filter((toast) => toast.notification.id !== id),
          { notification: { ...options, id }, status: 'visible', renderKey },
        ],
      });
      return id;
    },
    close: (id?: string) => {
      const toastsToClose = toasts.filter(
        (toast) =>
          isVisibleToast(toast) &&
          (!isDefined(id) || toast.notification.id === id),
      );

      if (!isNonEmptyArray(toastsToClose)) {
        return;
      }

      dismiss({ toastsToClose });
    },
    completeExit: (toast: ToastEntry) => {
      const isCurrentClosingToast =
        toast.status === 'closing' && toasts.includes(toast);

      if (!isCurrentClosingToast) {
        return;
      }

      publish(toasts.filter((currentToast) => currentToast !== toast));
    },
  };
};
