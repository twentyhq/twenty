'use client';

import { useEffect, useState } from 'react';

import { useTimeoutRegistry } from '@/lib/react';

import type { LiveDataPhase } from '../utils/live-data-phase';

const LIVE_DATA_SEQUENCE: Array<{
  delay: number;
  phase: Exclude<LiveDataPhase, 'idle'>;
}> = [
  { delay: 0, phase: 'move-to-tag' },
  { delay: 760, phase: 'rename-tag' },
  { delay: 1700, phase: 'return-to-start' },
  { delay: 2380, phase: 'bob-ready' },
  { delay: 2620, phase: 'move-to-filter' },
  { delay: 3260, phase: 'remove-filter' },
  { delay: 3900, phase: 'return-bob' },
  { delay: 4680, phase: 'settle' },
];

const EDITED_TAG_LABEL = 'Priority';
const TYPING_STEP_MS = 90;

export function useLiveDataDemoTimeline(active: boolean) {
  const timeoutRegistry = useTimeoutRegistry();
  const [phase, setPhase] = useState<LiveDataPhase>('idle');
  const [typedTagLabel, setTypedTagLabel] = useState('');

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }

    const cancelSequenceSteps: Array<() => void> = [];
    setPhase('move-to-tag');

    for (const step of LIVE_DATA_SEQUENCE.slice(1)) {
      cancelSequenceSteps.push(
        timeoutRegistry.schedule(() => {
          setPhase(step.phase);
        }, step.delay),
      );
    }

    return () => {
      cancelSequenceSteps.forEach((cancelSequenceStep) => cancelSequenceStep());
    };
  }, [active, timeoutRegistry]);

  useEffect(() => {
    if (phase === 'rename-tag') {
      setTypedTagLabel(EDITED_TAG_LABEL.slice(0, 1));

      let nextIndex = 2;
      const cancelTypingSteps: Array<() => void> = [];

      const scheduleNextTypingStep = () => {
        const cancelTypingStep = timeoutRegistry.schedule(() => {
          setTypedTagLabel(EDITED_TAG_LABEL.slice(0, nextIndex));
          nextIndex += 1;

          if (nextIndex <= EDITED_TAG_LABEL.length) {
            scheduleNextTypingStep();
          }
        }, TYPING_STEP_MS);

        cancelTypingSteps.push(cancelTypingStep);
      };

      scheduleNextTypingStep();

      return () => {
        cancelTypingSteps.forEach((cancelTypingStep) => cancelTypingStep());
      };
    }

    if (
      phase === 'return-to-start' ||
      phase === 'bob-ready' ||
      phase === 'move-to-filter' ||
      phase === 'remove-filter' ||
      phase === 'return-bob' ||
      phase === 'settle'
    ) {
      setTypedTagLabel(EDITED_TAG_LABEL);
      return;
    }

    setTypedTagLabel('');
  }, [phase, timeoutRegistry]);

  return { phase, typedTagLabel };
}
