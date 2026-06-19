'use client';

import { useEffect, useRef, useState } from 'react';

import { animatedNumber } from './animated-number';
import { createAnimationFrameLoop } from './animation-frame-loop';
import { getReducedMotionSnapshot } from './reduced-motion-snapshot';

// Tweens the displayed integer toward the target on a rAF loop (the
// pricing cards' price counter). Reduced motion snaps to the target.
export function useAnimatedNumber(target: number): number {
  const [display, setDisplay] = useState(() => Math.round(target));
  const displayRef = useRef(display);
  displayRef.current = display;

  useEffect(() => {
    const roundedTarget = Math.round(target);
    const from = displayRef.current;

    if (from === roundedTarget) {
      return undefined;
    }
    if (getReducedMotionSnapshot() || typeof window === 'undefined') {
      setDisplay(roundedTarget);
      return undefined;
    }

    const startedAt = performance.now();
    const frameLoop = createAnimationFrameLoop({
      onFrame: () => {
        const elapsedMs = performance.now() - startedAt;
        const value = animatedNumber.valueAt({
          elapsedMs,
          from,
          target: roundedTarget,
        });
        setDisplay(value);
        return elapsedMs < animatedNumber.defaultDurationMs;
      },
    });
    frameLoop.start();

    return () => {
      frameLoop.stop();
    };
  }, [target]);

  return display;
}
