import { isPositiveInteger } from '@sniptt/guards';

import { type createToastStore } from '../stores/createToastStore';
import { dismissToasts } from './dismissToasts';
import { isToastVisible } from './isToastVisible';

export const updateToastLimit = ({
  store,
  limit,
}: {
  store: ReturnType<typeof createToastStore>;
  limit: number;
}) => {
  if (!isPositiveInteger(limit)) {
    throw new Error('Toast limit must be a positive integer.');
  }

  if (store.state.limit === limit) {
    return;
  }

  store.set('limit', limit);
  const visibleToasts = store.state.toasts.filter(isToastVisible);
  const removedCount = Math.max(0, visibleToasts.length - limit);

  if (removedCount === 0) {
    return;
  }

  dismissToasts({
    store,
    toastsToClose: visibleToasts.slice(0, removedCount),
  });
};
