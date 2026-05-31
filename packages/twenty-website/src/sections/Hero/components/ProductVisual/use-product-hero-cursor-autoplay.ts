'use client';

import { useEffect, useState } from 'react';

export type ProductHeroCursorState = {
  clicking: boolean;
  moveMs: number;
  position: 'start' | 'target';
  showRecord: boolean;
};

type CursorPhase = ProductHeroCursorState & { durationMs: number };

// One pass: settle at start, glide to the row, click, open the record — then stop
// on the terminal phase (no return to the table, no looping).
const PHASES: CursorPhase[] = [
  {
    position: 'start',
    clicking: false,
    durationMs: 900,
    moveMs: 0,
    showRecord: false,
  },
  {
    position: 'target',
    clicking: false,
    durationMs: 2200,
    moveMs: 1800,
    showRecord: false,
  },
  {
    position: 'target',
    clicking: true,
    durationMs: 480,
    moveMs: 0,
    showRecord: false,
  },
  {
    position: 'target',
    clicking: false,
    durationMs: 0,
    moveMs: 0,
    showRecord: true,
  },
];

export function useProductHeroCursorAutoplay(
  enabled: boolean,
): ProductHeroCursorState {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!enabled || phaseIndex >= PHASES.length - 1) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setPhaseIndex((current) => current + 1);
    }, PHASES[phaseIndex].durationMs);

    return () => clearTimeout(timer);
  }, [enabled, phaseIndex]);

  const { clicking, moveMs, position, showRecord } = PHASES[phaseIndex];

  return { clicking, moveMs, position, showRecord };
}
