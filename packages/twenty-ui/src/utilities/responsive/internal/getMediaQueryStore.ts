import { isFunction } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

type MediaQueryStore = {
  getSnapshot: () => boolean;
  subscribe: (onStoreChange: () => void) => () => void;
};

const UNSUPPORTED_MEDIA_QUERY_STORE: MediaQueryStore = {
  getSnapshot: () => false,
  subscribe: () => () => {},
};

const mediaQueryStoresByMatchMediaImplementation = new WeakMap<
  Window['matchMedia'],
  Map<string, MediaQueryStore>
>();

const createMediaQueryStore = (
  mediaQueryList: MediaQueryList,
): MediaQueryStore => ({
  getSnapshot: () => mediaQueryList.matches,
  subscribe: (onStoreChange) => {
    mediaQueryList.addEventListener('change', onStoreChange);

    return () => mediaQueryList.removeEventListener('change', onStoreChange);
  },
});

const getMediaQueryStoresByQuery = (matchMedia: Window['matchMedia']) => {
  const cachedMediaQueryStoresByQuery =
    mediaQueryStoresByMatchMediaImplementation.get(matchMedia);

  if (isDefined(cachedMediaQueryStoresByQuery)) {
    return cachedMediaQueryStoresByQuery;
  }

  const mediaQueryStoresByQuery = new Map<string, MediaQueryStore>();

  mediaQueryStoresByMatchMediaImplementation.set(
    matchMedia,
    mediaQueryStoresByQuery,
  );

  return mediaQueryStoresByQuery;
};

export const getMediaQueryStore = (query: string): MediaQueryStore => {
  if (typeof window === 'undefined' || !isFunction(window.matchMedia)) {
    return UNSUPPORTED_MEDIA_QUERY_STORE;
  }

  const mediaQueryStoresByQuery = getMediaQueryStoresByQuery(window.matchMedia);
  const cachedMediaQueryStore = mediaQueryStoresByQuery.get(query);

  if (isDefined(cachedMediaQueryStore)) {
    return cachedMediaQueryStore;
  }

  const mediaQueryStore = createMediaQueryStore(window.matchMedia(query));

  mediaQueryStoresByQuery.set(query, mediaQueryStore);

  return mediaQueryStore;
};
