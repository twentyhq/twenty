'use client';

import { useEffect, useState } from 'react';

import {
  cursorTour,
  type CursorTarget,
  type TourPhase,
} from './cursor-tour-phases';

export type ProductHeroTourState = {
  activeCursor: number;
  clicking: boolean;
  glideMs?: number;
  hidden: boolean;
  pageItemId: string;
  recordTab?: string;
  showRecord: boolean;
  target: CursorTarget;
};

export function useProductHeroCursorAutoplay(
  enabled: boolean,
  { mobile = false }: { mobile?: boolean } = {},
): ProductHeroTourState {
  const phases: TourPhase[] = mobile
    ? cursorTour.MOBILE_PHASES
    : cursorTour.DESKTOP_PHASES;

  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setPhaseIndex(0);
      return undefined;
    }

    const timer = setTimeout(() => {
      setPhaseIndex((current) =>
        cursorTour.nextPhaseIndex(current, phases.length),
      );
    }, phases[phaseIndex].durationMs);

    return () => clearTimeout(timer);
  }, [enabled, phaseIndex, phases]);

  const phase = phases[phaseIndex];

  return {
    activeCursor: phase.activeCursor,
    clicking: phase.clicking,
    glideMs: phase.glideMs,
    hidden: phase.hidden,
    pageItemId: phase.pageItemId,
    recordTab: phase.recordTab,
    showRecord: phase.showRecord,
    target: phase.target,
  };
}
