import { type createToastStore } from '../stores/createToastStore';
import { assertValidToastLimit } from './assertValidToastLimit';
import { dismissToasts } from './dismissToasts';
import { isToastVisible } from './isToastVisible';

export const updateToastLimit = ({
  store,
  limit,
}: {
  store: ReturnType<typeof createToastStore>;
  limit: number;
}) => {
  assertValidToastLimit(limit);

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
