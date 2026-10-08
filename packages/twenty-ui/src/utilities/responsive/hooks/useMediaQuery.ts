import { useSyncExternalStore } from 'react';

import { getMediaQueryStore } from '@ui/utilities/responsive/internal/getMediaQueryStore';

const getServerSnapshot = () => false;

export const useMediaQuery = (query: string) => {
  const { subscribe, getSnapshot } = getMediaQueryStore(query);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
