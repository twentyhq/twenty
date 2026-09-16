import { isNonEmptyArray } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { dismissToasts } from '../utils/dismissToasts';
import { isToastVisible } from '../utils/isToastVisible';
import { useToastContext } from './useToastContext';

export const useCloseToast = () => {
  const store = useToastContext();

  const closeToast = (id?: string) => {
    const toastsToClose = store.state.toasts.filter(
      (toast) =>
        isToastVisible(toast) &&
        (!isDefined(id) || toast.notification.id === id),
    );

    if (!isNonEmptyArray(toastsToClose)) {
      return;
    }

    dismissToasts({ store, toastsToClose });
  };

  return { closeToast };
};
