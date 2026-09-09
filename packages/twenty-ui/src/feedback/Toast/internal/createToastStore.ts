import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ToastOptions } from '../types/ToastOptions';
import { type ToastEntry } from './ToastEntry';

export const createToastStore = () => {
  const emptyToasts: ToastEntry[] = [];
  let toasts = emptyToasts;
  const listeners = new Set<() => void>();

  const publish = (nextToasts: ToastEntry[]) => {
    // Closing cards only need retaining while a viewport can animate them.
    toasts =
      listeners.size === 0
        ? nextToasts.filter((toast) => toast.status === 'visible')
        : nextToasts;
    listeners.forEach((listener) => listener());
  };

  const dismiss = (
    toastsToClose: ToastEntry[],
    nextToasts: ToastEntry[] = toasts,
  ) => {
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
        if (listeners.size === 0) {
          publish(toasts);
        }
      };
    },
    getSnapshot: () => toasts,
    getServerSnapshot: () => emptyToasts,
    add: (options: ToastOptions, limit: number) => {
      const visibleToasts = toasts.filter(
        (toast) => toast.status === 'visible',
      );
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
      const removedCount = Math.max(0, visibleToasts.length - limit + 1);
      dismiss(visibleToasts.slice(0, removedCount), [
        ...toasts.filter((toast) => toast.notification.id !== id),
        { notification: { ...options, id }, status: 'visible' },
      ]);
      return id;
    },
    close: (id?: string) => {
      const toastsToClose = toasts.filter(
        (toast) =>
          toast.status === 'visible' &&
          (!isDefined(id) || toast.notification.id === id),
      );

      if (toastsToClose.length === 0) {
        return;
      }

      dismiss(toastsToClose);
    },
    completeExit: (toast: ToastEntry) => {
      // An old exit must not remove a restored toast, even if it closed again.
      if (toast.status !== 'closing' || !toasts.includes(toast)) {
        return;
      }

      publish(toasts.filter((currentToast) => currentToast !== toast));
    },
  };
};
