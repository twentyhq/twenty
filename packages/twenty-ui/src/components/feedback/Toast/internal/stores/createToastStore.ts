import { Store } from '@base-ui/utils/store';
import { isPositiveInteger } from '@sniptt/guards';

import { DEFAULT_TOAST_LIMIT } from '../constants/DefaultToastLimit';
import { type ToastStoreState } from '../types/ToastStoreState';
import { createToastLifecycle } from '../utils/createToastLifecycle';

export const createToastStore = (limit = DEFAULT_TOAST_LIMIT) => {
  if (!isPositiveInteger(limit)) {
    throw new Error('Toast limit must be a positive integer.');
  }

  const store = new Store<ToastStoreState>({
    toasts: [],
    limit,
    mountedToasterCount: 0,
  });

  return Object.assign(store, { lifecycle: createToastLifecycle(store) });
};
