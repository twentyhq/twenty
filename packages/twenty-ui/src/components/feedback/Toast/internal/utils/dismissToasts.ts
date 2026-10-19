import { type Store } from '@base-ui/utils/store';

import { type ToastStoreState } from '../types/ToastStoreState';
import { type ToastEntry } from '../types/ToastEntry';
import { isToastVisible } from './isToastVisible';

export const dismissToasts = ({
  store,
  toastsToClose,
  nextToasts = store.state.toasts,
}: {
  store: Store<ToastStoreState>;
  toastsToClose: ToastEntry[];
  nextToasts?: ToastEntry[];
}) => {
  const visibleToastsToClose = toastsToClose.filter(
    (toast) => isToastVisible(toast) && store.state.toasts.includes(toast),
  );
  const toasts = nextToasts.map((toast): ToastEntry =>
    visibleToastsToClose.includes(toast)
      ? { ...toast, status: 'closing' }
      : toast,
  );

  const isToasterMounted = store.state.mountedToasterCount > 0;

  store.set(
    'toasts',
    isToasterMounted ? toasts : toasts.filter(isToastVisible),
  );

  for (const toast of visibleToastsToClose) {
    toast.notification.onClose?.();
  }
};
