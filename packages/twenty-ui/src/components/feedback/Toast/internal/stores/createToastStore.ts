import { Store } from '@base-ui/utils/store';

import { DEFAULT_TOAST_LIMIT } from '../constants/DefaultToastLimit';
import { type ToastStoreState } from '../types/ToastStoreState';
import { assertValidToastLimit } from '../utils/assertValidToastLimit';
import { createToastLifecycle } from '../utils/createToastLifecycle';

export const createToastStore = (limit = DEFAULT_TOAST_LIMIT) => {
  assertValidToastLimit(limit);

  const store = new Store<ToastStoreState>({
    toasts: [],
    limit,
    mountedToasterCount: 0,
  });

  return Object.assign(store, { lifecycle: createToastLifecycle(store) });
};
