'use client';

import { useEffect, useState } from 'react';

export type ProductHeroCursorState = {
  clicking: boolean;
  moveMs: number;
  position: 'start' | 'target';
  showRecord: boolean;
};

type CursorPhase = ProductHeroCursorState & { durationMs: number };

const PHASES: CursorPhase[] = [
  {
    position: 'start',
    clicking: false,
    durationMs: 700,
    moveMs: 0,
    showRecord: false,
  },
  {
    position: 'target',
    clicking: false,
    durationMs: 2000,
    moveMs: 1700,
    showRecord: false,
  },
  {
    position: 'target',
    clicking: true,
    durationMs: 420,
    moveMs: 0,
    showRecord: false,
  },
  {
    position: 'target',
    clicking: false,
    durationMs: 3200,
    moveMs: 0,
    showRecord: true,
  },
  {
    position: 'start',
    clicking: false,
    durationMs: 600,
    moveMs: 0,
    showRecord: true,
  },
];

export function useProductHeroCursorAutoplay(
  enabled: boolean,
): ProductHeroCursorState {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setPhaseIndex((current) => (current + 1) % PHASES.length);
    }, PHASES[phaseIndex].durationMs);

    return () => clearTimeout(timer);
  }, [enabled, phaseIndex]);

  const { clicking, moveMs, position, showRecord } = PHASES[phaseIndex];

  return { clicking, moveMs, position, showRecord };
}
