import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { type RefObject, useEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

export const useLoadMoreOnScroll = ({
  sentinelRef,
  scrollContainerRef,
  enabled,
  onLoadMore,
}: {
  sentinelRef: RefObject<HTMLElement | null>;
  scrollContainerRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  onLoadMore: () => void;
}) => {
  const loadMore = useStableCallback(onLoadMore);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollContainer = scrollContainerRef.current;

    if (!enabled || !isDefined(sentinel) || !isDefined(scrollContainer)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { root: scrollContainer, rootMargin: '10px', threshold: 1 },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [enabled, sentinelRef, scrollContainerRef, loadMore]);
};
