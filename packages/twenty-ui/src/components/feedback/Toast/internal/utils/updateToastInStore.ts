import { isNonEmptyArray } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ToastUpdate } from '../../types/ToastUpdate';
import { type createToastStore } from '../stores/createToastStore';
import { isToastVisible } from './isToastVisible';

export const updateToastInStore = ({
  store,
  id,
  ...changes
}: ToastUpdate & { store: ReturnType<typeof createToastStore> }) => {
  const toastToUpdate = store.state.toasts.find(
    (toast) => toast.notification.id === id && isToastVisible(toast),
  );

  if (!isDefined(toastToUpdate) || !isNonEmptyArray(Object.keys(changes))) {
    return;
  }

  store.set(
    'toasts',
    store.state.toasts.map((toast) =>
      toast === toastToUpdate
        ? {
            ...toast,
            notification: { ...toast.notification, ...changes, id },
          }
        : toast,
    ),
  );
};
