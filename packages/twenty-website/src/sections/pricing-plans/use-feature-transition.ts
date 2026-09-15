'use client';

import { type MessageDescriptor } from '@lingui/core';
import { useEffect, useState } from 'react';

import { useTimeoutRegistry } from '@/app-preview/stage/use-timeout-registry';
import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';

import { FEATURE_TRANSITION_TIMING } from './feature-transition-timing';

export type FeatureTransitionPhase = 'entering' | 'exiting' | 'stable';

function getBulletsKey(bullets: MessageDescriptor[]) {
  return bullets.map((bullet) => getMessageDescriptorSource(bullet)).join('||');
}

// Swaps the visible bullet list in two beats: bullets unique to the old
// list stagger out, then bullets unique to the new list stagger in;
// bullets present in both stay put (the comparison set marks them).
export function useFeatureTransition(nextBullets: MessageDescriptor[]) {
  const timeouts = useTimeoutRegistry();
  const [visibleBullets, setVisibleBullets] = useState(nextBullets);
  const [queuedBullets, setQueuedBullets] = useState<
    MessageDescriptor[] | null
  >(null);
  const [comparisonBullets, setComparisonBullets] = useState<
    MessageDescriptor[] | null
  >(null);
  const [phase, setPhase] = useState<FeatureTransitionPhase>('stable');

  useEffect(() => {
    const nextKey = getBulletsKey(nextBullets);

    if (
      nextKey === getBulletsKey(visibleBullets) ||
      nextKey === getBulletsKey(queuedBullets ?? [])
    ) {
      return;
    }
    setQueuedBullets(nextBullets);

    if (phase === 'stable') {
      setPhase('exiting');
    }
  }, [nextBullets, phase, queuedBullets, visibleBullets]);

  useEffect(() => {
    if (phase !== 'exiting' || !queuedBullets) {
      return undefined;
    }
    return timeouts.schedule(
      () => {
        setComparisonBullets(visibleBullets);
        setVisibleBullets(queuedBullets);
        setQueuedBullets(null);
        setPhase('entering');
      },
      FEATURE_TRANSITION_TIMING.switchMilliseconds +
        FEATURE_TRANSITION_TIMING.staggerMilliseconds * visibleBullets.length,
    );
  }, [phase, queuedBullets, timeouts, visibleBullets]);

  useEffect(() => {
    if (phase !== 'entering') {
      return undefined;
    }
    return timeouts.schedule(
      () => {
        setComparisonBullets(null);
        setPhase('stable');
      },
      FEATURE_TRANSITION_TIMING.switchMilliseconds +
        FEATURE_TRANSITION_TIMING.staggerMilliseconds * visibleBullets.length,
    );
  }, [phase, timeouts, visibleBullets]);

  const comparisonBulletTexts = new Set(
    (phase === 'exiting' ? queuedBullets : comparisonBullets)?.map((bullet) =>
      getMessageDescriptorSource(bullet),
    ) ?? [],
  );

  return { comparisonBulletTexts, phase, visibleBullets };
}
