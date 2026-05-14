'use client';

import { useEffect, useRef, useState } from 'react';

import { useLatestRef } from '@/lib/react';

import {
  DEFAULT_ANIMATED_NUMBER_DURATION_MS,
  easeOutCubic,
  getAnimatedNumberValue,
  type AnimatedNumberEasing,
  type AnimatedNumberRounder,
} from './animated-number';
import { createAnimationFrameLoop } from './animation-frame-loop';

type UseAnimatedNumberOptions = {
  disabled?: boolean;
  durationMs?: number;
  easing?: AnimatedNumberEasing;
  round?: AnimatedNumberRounder;
};

const DEFAULT_ANIMATED_NUMBER_ROUNDER: AnimatedNumberRounder = Math.round;

function canScheduleAnimationFrame() {
  return (
    typeof window !== 'undefined' &&
    typeof window.requestAnimationFrame === 'function' &&
    typeof window.cancelAnimationFrame === 'function'
  );
}

function getAnimationTimestamp() {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

export function useAnimatedNumber(
  target: number,
  {
    disabled = false,
    durationMs = DEFAULT_ANIMATED_NUMBER_DURATION_MS,
    easing = easeOutCubic,
    round = DEFAULT_ANIMATED_NUMBER_ROUNDER,
  }: UseAnimatedNumberOptions = {},
): number {
  const [display, setDisplay] = useState(() => round(target));
  const displayRef = useRef(display);
  const easingRef = useLatestRef(easing);
  const roundRef = useLatestRef(round);

  useEffect(() => {
    const roundedTarget = roundRef.current(target);
    const from = displayRef.current;

    if (
      disabled ||
      !Number.isFinite(durationMs) ||
      durationMs <= 0 ||
      from === roundedTarget ||
      !canScheduleAnimationFrame()
    ) {
      displayRef.current = roundedTarget;
      setDisplay(roundedTarget);

      return;
    }

    const startTime = getAnimationTimestamp();
    const animationLoop = createAnimationFrameLoop({
      onFrame: (now) => {
        const elapsedMs = now - startTime;
        const nextDisplay = getAnimatedNumberValue({
          durationMs,
          easing: easingRef.current,
          elapsedMs,
          from,
          round: roundRef.current,
          target,
        });

        if (displayRef.current !== nextDisplay) {
          displayRef.current = nextDisplay;
          setDisplay(nextDisplay);
        }

        return elapsedMs < durationMs;
      },
    });

    animationLoop.start();

    return () => {
      animationLoop.stop();
    };
  }, [disabled, durationMs, easingRef, roundRef, target]);

  return display;
}
