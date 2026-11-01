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
  if (!store.lifecycle.isActive()) {
    return;
  }

  const toastToUpdate = store.state.toasts.find(
    (toast) => toast.notification.id === id && isToastVisible(toast),
  );

  const changedFields = Object.keys(changes);

  if (!isDefined(toastToUpdate) || !isNonEmptyArray(changedFields)) {
    return;
  }

  const shouldRestartCountdown =
    changedFields.includes('duration') ||
    (isDefined(toastToUpdate.notification.progress) &&
      changedFields.includes('progress') &&
      !isDefined(changes.progress));

  store.set(
    'toasts',
    store.state.toasts.map((toast) =>
      toast === toastToUpdate
        ? {
            ...toast,
            notification: { ...toast.notification, ...changes, id },
            ...(shouldRestartCountdown
              ? { durationRevision: (toast.durationRevision ?? 0) + 1 }
              : {}),
          }
        : toast,
    ),
  );
};
