import { type createToastStore } from '../stores/createToastStore';
import { type ToastEntry } from '../types/ToastEntry';
import { isToastVisible } from './isToastVisible';

export const dismissToasts = ({
  store,
  toastsToClose,
  nextToasts = store.state.toasts,
}: {
  store: ReturnType<typeof createToastStore>;
  toastsToClose: ToastEntry[];
  nextToasts?: ToastEntry[];
}) => {
  const toasts = nextToasts.map(
    (toast): ToastEntry =>
      toastsToClose.includes(toast) ? { ...toast, status: 'closing' } : toast,
  );

  const isToasterMounted = store.state.mountedToasterCount > 0;

  store.set(
    'toasts',
    isToasterMounted ? toasts : toasts.filter(isToastVisible),
  );

  for (const toast of toastsToClose) {
    toast.notification.onClose?.();
  }
};
