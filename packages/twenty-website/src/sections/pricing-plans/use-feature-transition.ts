'use client';

import { useEffect, useState } from 'react';

import { useTimeoutRegistry } from '@/app-preview/stage/use-timeout-registry';

import { FEATURE_TRANSITION_TIMING } from './feature-transition-timing';

export type FeatureTransitionPhase = 'entering' | 'exiting' | 'stable';

// Swaps the visible item list in two beats: items unique to the old
// list stagger out, then items unique to the new list stagger in;
// items present in both stay put (the comparison set marks them).
export function useFeatureTransition<TItem>(
  nextItems: TItem[],
  getItemKey: (item: TItem, itemIndex: number) => string,
) {
  const timeouts = useTimeoutRegistry();
  const [visibleItems, setVisibleItems] = useState(nextItems);
  const [queuedItems, setQueuedItems] = useState<TItem[] | null>(null);
  const [comparisonItems, setComparisonItems] = useState<TItem[] | null>(null);
  const [phase, setPhase] = useState<FeatureTransitionPhase>('stable');

  useEffect(() => {
    const getItemsKey = (items: TItem[]) => items.map(getItemKey).join('||');
    const nextKey = getItemsKey(nextItems);

    if (
      nextKey === getItemsKey(visibleItems) ||
      nextKey === getItemsKey(queuedItems ?? [])
    ) {
      return;
    }
    setQueuedItems(nextItems);

    if (phase === 'stable') {
      setPhase('exiting');
    }
  }, [getItemKey, nextItems, phase, queuedItems, visibleItems]);

  useEffect(() => {
    if (phase !== 'exiting' || !queuedItems) {
      return undefined;
    }
    return timeouts.schedule(
      () => {
        setComparisonItems(visibleItems);
        setVisibleItems(queuedItems);
        setQueuedItems(null);
        setPhase('entering');
      },
      FEATURE_TRANSITION_TIMING.switchMilliseconds +
        FEATURE_TRANSITION_TIMING.staggerMilliseconds * visibleItems.length,
    );
  }, [phase, queuedItems, timeouts, visibleItems]);

  useEffect(() => {
    if (phase !== 'entering') {
      return undefined;
    }
    return timeouts.schedule(
      () => {
        setComparisonItems(null);
        setPhase('stable');
      },
      FEATURE_TRANSITION_TIMING.switchMilliseconds +
        FEATURE_TRANSITION_TIMING.staggerMilliseconds * visibleItems.length,
    );
  }, [phase, timeouts, visibleItems]);

  const comparisonItemKeys = new Set(
    (phase === 'exiting' ? queuedItems : comparisonItems)?.map(getItemKey) ??
      [],
  );

  return { comparisonItemKeys, phase, visibleItems };
}
