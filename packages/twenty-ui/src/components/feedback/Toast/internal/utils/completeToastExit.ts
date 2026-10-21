import { type Store } from '@base-ui/utils/store';

import { type ToastStoreState } from '../types/ToastStoreState';
import { type ToastEntry } from '../types/ToastEntry';

export const completeToastExit = ({
  store,
  toast,
}: {
  store: Store<ToastStoreState>;
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
