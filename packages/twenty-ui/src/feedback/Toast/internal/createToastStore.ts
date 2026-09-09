import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ToastNotification } from '../types/ToastNotification';
import { type ToastOptions } from '../types/ToastOptions';

export const createToastStore = () => {
  const emptyToasts: ToastNotification[] = [];
  let toasts = emptyToasts;
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((listener) => listener());

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => toasts,
    getServerSnapshot: () => emptyToasts,
    add: (options: ToastOptions, limit: number) => {
      const existingToast = toasts.find(
        (toast) =>
          (isDefined(options.dedupeKey) &&
            toast.dedupeKey === options.dedupeKey) ||
          (isDefined(options.id) && toast.id === options.id),
      );

      if (isDefined(existingToast)) {
        return existingToast.id;
      }

      const id = options.id ?? crypto.randomUUID();
      const removedCount = Math.max(0, toasts.length - limit + 1);
      const removedToasts = toasts.slice(0, removedCount);
      toasts = [...toasts.slice(removedCount), { ...options, id }];
      notify();
      removedToasts.forEach((toast) => toast.onClose?.());
      return id;
    },
    close: (id?: string) => {
      const removedToasts = toasts.filter(
        (toast) => !isDefined(id) || toast.id === id,
      );

      if (removedToasts.length === 0) {
        return;
      }

      toasts = toasts.filter((toast) => isDefined(id) && toast.id !== id);
      notify();
      removedToasts.forEach((toast) => toast.onClose?.());
    },
  };
};
