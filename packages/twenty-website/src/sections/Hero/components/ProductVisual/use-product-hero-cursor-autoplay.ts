'use client';

import { useEffect, useState } from 'react';

export type CursorTarget =
  | { kind: 'home' }
  | { kind: 'row'; id: string }
  | { kind: 'rail'; id: string }
  | { kind: 'tab'; id: string };

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

type TourPhase = {
  activeCursor: number;
  clicking: boolean;
  durationMs: number;
  glideMs?: number;
  hidden: boolean;
  pageItemId: string;
  recordTab?: string;
  showRecord: boolean;
  target: CursorTarget;
};

const COMPANIES = 'companies';
const PEOPLE = 'people';
const NOTES = 'notes';
const RECORD_ROW_ID = 'anthropic';

const LOOP_START_INDEX = 0;

const PHASES: TourPhase[] = [
  {
    activeCursor: 0,
    pageItemId: COMPANIES,
    showRecord: false,
    target: { kind: 'home' },
    clicking: false,
    hidden: false,
    durationMs: 1400,
  },
  {
    activeCursor: 0,
    pageItemId: COMPANIES,
    showRecord: false,
    target: { kind: 'row', id: RECORD_ROW_ID },
    clicking: false,
    hidden: false,
    durationMs: 1000,
  },
  {
    activeCursor: 0,
    pageItemId: COMPANIES,
    showRecord: false,
    target: { kind: 'row', id: RECORD_ROW_ID },
    clicking: true,
    hidden: false,
    durationMs: 400,
  },
  {
    activeCursor: 1,
    pageItemId: COMPANIES,
    showRecord: true,
    recordTab: 'Timeline',
    target: { kind: 'home' },
    clicking: false,
    hidden: false,
    durationMs: 800,
  },
  {
    activeCursor: 1,
    pageItemId: COMPANIES,
    showRecord: true,
    recordTab: 'Timeline',
    target: { kind: 'tab', id: 'Notes' },
    clicking: false,
    hidden: false,
    durationMs: 900,
  },
  {
    activeCursor: 1,
    pageItemId: COMPANIES,
    showRecord: true,
    recordTab: 'Notes',
    target: { kind: 'tab', id: 'Notes' },
    clicking: true,
    hidden: false,
    durationMs: 450,
  },
  {
    activeCursor: 2,
    pageItemId: COMPANIES,
    showRecord: true,
    recordTab: 'Notes',
    target: { kind: 'home' },
    clicking: false,
    hidden: false,
    durationMs: 800,
  },
  {
    activeCursor: 2,
    pageItemId: COMPANIES,
    showRecord: true,
    recordTab: 'Notes',
    target: { kind: 'tab', id: 'Calendar' },
    clicking: false,
    hidden: false,
    durationMs: 750,
  },
  {
    activeCursor: 2,
    pageItemId: COMPANIES,
    showRecord: true,
    recordTab: 'Calendar',
    target: { kind: 'tab', id: 'Calendar' },
    clicking: true,
    hidden: false,
    durationMs: 700,
  },
  {
    activeCursor: 0,
    pageItemId: COMPANIES,
    showRecord: true,
    recordTab: 'Calendar',
    target: { kind: 'rail', id: PEOPLE },
    clicking: false,
    hidden: false,
    durationMs: 700,
  },
  {
    activeCursor: 0,
    pageItemId: PEOPLE,
    showRecord: true,
    recordTab: 'Calendar',
    target: { kind: 'rail', id: PEOPLE },
    clicking: true,
    hidden: false,
    durationMs: 300,
  },
  {
    activeCursor: 0,
    pageItemId: PEOPLE,
    showRecord: false,
    target: { kind: 'rail', id: PEOPLE },
    clicking: false,
    hidden: false,
    durationMs: 900,
  },
  {
    activeCursor: 1,
    pageItemId: PEOPLE,
    showRecord: false,
    target: { kind: 'rail', id: NOTES },
    clicking: false,
    hidden: false,
    durationMs: 800,
  },
  {
    activeCursor: 1,
    pageItemId: NOTES,
    showRecord: false,
    target: { kind: 'rail', id: NOTES },
    clicking: true,
    hidden: false,
    durationMs: 300,
  },
  {
    activeCursor: 1,
    pageItemId: NOTES,
    showRecord: false,
    target: { kind: 'rail', id: NOTES },
    clicking: false,
    hidden: false,
    durationMs: 600,
  },
  {
    activeCursor: 2,
    pageItemId: NOTES,
    showRecord: false,
    target: { kind: 'rail', id: COMPANIES },
    clicking: false,
    hidden: false,
    durationMs: 1100,
  },
  {
    activeCursor: 2,
    pageItemId: COMPANIES,
    showRecord: false,
    target: { kind: 'rail', id: COMPANIES },
    clicking: true,
    hidden: false,
    durationMs: 300,
  },
];

export function useProductHeroCursorAutoplay(
  enabled: boolean,
): ProductHeroTourState {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setPhaseIndex(0);
      return undefined;
    }

    const timer = setTimeout(() => {
      setPhaseIndex((current) =>
        current >= PHASES.length - 1 ? LOOP_START_INDEX : current + 1,
      );
    }, PHASES[phaseIndex].durationMs);

    return () => clearTimeout(timer);
  }, [enabled, phaseIndex]);

  const phase = PHASES[phaseIndex];

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
