import { isNonEmptyArray } from '@sniptt/guards';
import { useCallback } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { toastState } from '../states/toastState';
import { isVisibleToast } from '../utils/isVisibleToast';
import { useDismissToasts } from './useDismissToasts';
import { useToastContext } from './useToastContext';

export const useCloseToast = () => {
  const store = useToastContext();
  const { dismissToasts } = useDismissToasts();

  const closeToast = useCallback(
    (id?: string) => {
      const toastsToClose = store
        .get(toastState)
        .toasts.filter(
          (toast) =>
            isVisibleToast(toast) &&
            (!isDefined(id) || toast.notification.id === id),
        );

      if (!isNonEmptyArray(toastsToClose)) {
        return;
      }

      dismissToasts({ toastsToClose });
    },
    [store, dismissToasts],
  );

  return { closeToast };
};
