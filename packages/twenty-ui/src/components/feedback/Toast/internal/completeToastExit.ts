import { type createToastStore } from './createToastStore';
import { type ToastEntry } from './ToastEntry';

export const completeToastExit = ({
  store,
  toast,
}: {
  store: ReturnType<typeof createToastStore>;
  toast: ToastEntry;
}) => {
  const { toasts } = store.state;
  const isCurrentClosingToast =
    toast.status === 'closing' && toasts.includes(toast);

  if (!isCurrentClosingToast) {
    return;
  }

  store.set(
    'toasts',
    toasts.filter((currentToast) => currentToast !== toast),
  );
};
