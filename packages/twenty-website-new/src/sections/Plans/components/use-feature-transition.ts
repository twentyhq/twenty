import type { MessageDescriptor } from '@lingui/core';

import { getMessageDescriptorSource } from '@/lib/i18n/utils/get-message-descriptor-source';
import { useTimeoutRegistry } from '@/lib/react';
import { useEffect, useState } from 'react';

import { FEATURE_ITEM_STAGGER_MS } from './feature-item-stagger-ms';
import type { FeatureTransitionPhase } from './feature-transition-phase';

const FEATURES_SWITCH_ANIMATION_MS = 110;

function getBulletsKey(bullets: MessageDescriptor[]) {
  return bullets.map((bullet) => getMessageDescriptorSource(bullet)).join('||');
}

export function useFeatureTransition(nextBullets: MessageDescriptor[]) {
  const timeoutRegistry = useTimeoutRegistry();
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
      return;
    }

    return timeoutRegistry.schedule(
      () => {
        setComparisonBullets(visibleBullets);
        setVisibleBullets(queuedBullets);
        setQueuedBullets(null);
        setPhase('entering');
      },
      FEATURES_SWITCH_ANIMATION_MS +
        FEATURE_ITEM_STAGGER_MS * visibleBullets.length,
    );
  }, [phase, queuedBullets, timeoutRegistry, visibleBullets]);

  useEffect(() => {
    if (phase !== 'entering') {
      return;
    }

    return timeoutRegistry.schedule(
      () => {
        setComparisonBullets(null);
        setPhase('stable');
      },
      FEATURES_SWITCH_ANIMATION_MS +
        FEATURE_ITEM_STAGGER_MS * visibleBullets.length,
    );
  }, [phase, timeoutRegistry, visibleBullets]);

  const comparisonBulletTexts = new Set(
    (phase === 'exiting' ? queuedBullets : comparisonBullets)?.map((bullet) =>
      getMessageDescriptorSource(bullet),
    ) ?? [],
  );

  return { comparisonBulletTexts, phase, visibleBullets };
}
