import { useMemo } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { toastState } from '../states/toastState';
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

      const state = store.get(toastState);
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

      dismissToasts({
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
    }

    return enqueueToast;
  }, [store, dismissToasts]);

  return { enqueueToast };
};
