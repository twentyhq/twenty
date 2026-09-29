import { Store } from '@base-ui/utils/store';
import { isPositiveInteger } from '@sniptt/guards';

import { DEFAULT_TOAST_LIMIT } from './DefaultToastLimit';
import { type ToastStoreState } from './ToastStoreState';

export const createToastStore = (limit = DEFAULT_TOAST_LIMIT) => {
  if (!isPositiveInteger(limit)) {
    throw new Error('Toast limit must be a positive integer.');
  }

  return new Store<ToastStoreState>({
    toasts: [],
    limit,
    mountedToasterCount: 0,
  });
};
