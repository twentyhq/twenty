import { useMemo } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ToastOptions } from '../types/ToastOptions';
import { dismissToasts } from '../utils/dismissToasts';
import { isToastVisible } from '../utils/isToastVisible';
import { useToastContext } from './useToastContext';

let lastToastId = 0;

export const useEnqueueToast = () => {
  const store = useToastContext();

  const enqueueToast = useMemo(() => {
    function enqueueToast(options: ToastOptions): string;
    function enqueueToast(
      options: ToastOptions | undefined,
    ): string | undefined;
    function enqueueToast(options: ToastOptions | undefined) {
      if (!isDefined(options)) {
        return;
      }

      const { dedupeKey, ...toastProps } = options;
      const { toasts, limit } = store.state;
      const visibleToasts = toasts.filter(isToastVisible);
      const existingToast = isDefined(dedupeKey)
        ? visibleToasts.find((toast) => toast.dedupeKey === dedupeKey)
        : undefined;

      if (isDefined(existingToast)) {
        return existingToast.notification.id;
      }

      lastToastId += 1;
      const id = `toast-${lastToastId}`;
      const removedCount = Math.max(0, visibleToasts.length - limit + 1);

      dismissToasts({
        store,
        toastsToClose: visibleToasts.slice(0, removedCount),
        nextToasts: [
          ...toasts,
          {
            notification: { ...toastProps, id },
            dedupeKey,
            status: 'visible',
          },
        ],
      });

      return id;
    }

    return enqueueToast;
  }, [store]);

  return { enqueueToast };
};
