import { useMemo } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { nextToastRenderKeyState } from '../states/nextToastRenderKeyState';
import { toastLimitState } from '../states/toastLimitState';
import { toastsState } from '../states/toastsState';
import { type ToastOptions } from '../types/ToastOptions';
import { isVisibleToast } from '../utils/isVisibleToast';
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
      const limit = store.get(toastLimitState);
      const renderKey = store.get(nextToastRenderKeyState);
      const removedCount = Math.max(0, visibleToasts.length - limit + 1);

      store.set(nextToastRenderKeyState, renderKey + 1);

      dismissToasts({
        toastsToClose: visibleToasts.slice(0, removedCount),
        nextToasts: [
          ...toasts.filter((toast) => toast.notification.id !== id),
          {
            notification: { ...options, id },
            status: 'visible',
            renderKey,
          },
        ],
      });

      return id;
    }

    return enqueueToast;
  }, [store, dismissToasts]);

  return { enqueueToast };
};
