import { useMemo } from 'react';
import { v4 } from 'uuid';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { toastLimitState } from '../states/toastLimitState';
import { toastsState } from '../states/toastsState';
import { type ToastOptions } from '../types/ToastOptions';
import { isToastVisible } from '../utils/isToastVisible';
import { useDismissToasts } from './useDismissToasts';
import { useToastContext } from './useToastContext';

export const useEnqueueToast = () => {
  const store = useToastContext();
  const { dismissToasts } = useDismissToasts();

  const enqueueToast = useMemo(() => {
    function enqueueToast(options: ToastOptions): string;
    function enqueueToast(
      options: ToastOptions | undefined,
    ): string | undefined;
    function enqueueToast(options: ToastOptions | undefined) {
      if (!isDefined(options)) {
        return;
      }

      const toasts = store.get(toastsState);
      const visibleToasts = toasts.filter(isToastVisible);
      const existingToast = visibleToasts.find(
        ({ notification }) =>
          isDefined(options.dedupeKey) &&
          notification.dedupeKey === options.dedupeKey,
      );

      if (isDefined(existingToast)) {
        return existingToast.notification.id;
      }

      const id = v4();
      const limit = store.get(toastLimitState);
      const removedCount = Math.max(0, visibleToasts.length - limit + 1);

      dismissToasts({
        toastsToClose: visibleToasts.slice(0, removedCount),
        nextToasts: [
          ...toasts,
          {
            notification: { ...options, id },
            status: 'visible',
          },
        ],
      });

      return id;
    }

    return enqueueToast;
  }, [store, dismissToasts]);

  return { enqueueToast };
};
