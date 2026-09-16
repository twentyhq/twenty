import { isNonEmptyArray } from '@sniptt/guards';
import { useCallback } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { isToastVisible } from '../utils/isToastVisible';
import { useDismissToasts } from './useDismissToasts';
import { useToastContext } from './useToastContext';

export const useCloseToast = () => {
  const store = useToastContext();
  const { dismissToasts } = useDismissToasts();

  const closeToast = useCallback(
    (id?: string) => {
      const toastsToClose = store.state.toasts.filter(
        (toast) =>
          isToastVisible(toast) &&
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
