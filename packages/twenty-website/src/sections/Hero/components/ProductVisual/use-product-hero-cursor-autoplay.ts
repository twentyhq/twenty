'use client';

import { useEffect, useState } from 'react';

export type CursorTarget =
  | { kind: 'start' }
  | { kind: 'row'; id: string }
  | { kind: 'rail'; id: string };

export type ProductHeroTourState = {
  clicking: boolean;
  hidden: boolean;
  moveMs: number;
  pageItemId: string;
  showRecord: boolean;
  target: CursorTarget;
};

type TourPhase = ProductHeroTourState & { durationMs: number };

const COMPANIES = 'companies';
const PEOPLE = 'people';
const NOTES = 'notes';
const RECORD_ROW_ID = 'anthropic';

const LOOP_START_INDEX = 1;

const RECORD_DWELL_MS = 12800;

const PHASES: TourPhase[] = [
  {
    pageItemId: COMPANIES,
    showRecord: false,
    target: { kind: 'start' },
    clicking: false,
    hidden: false,
    moveMs: 0,
    durationMs: 1000,
  },
  {
    pageItemId: COMPANIES,
    showRecord: false,
    target: { kind: 'row', id: RECORD_ROW_ID },
    clicking: false,
    hidden: false,
    moveMs: 1500,
    durationMs: 1700,
  },
  {
    pageItemId: COMPANIES,
    showRecord: false,
    target: { kind: 'row', id: RECORD_ROW_ID },
    clicking: true,
    hidden: false,
    moveMs: 0,
    durationMs: 480,
  },
  {
    pageItemId: COMPANIES,
    showRecord: true,
    target: { kind: 'row', id: RECORD_ROW_ID },
    clicking: false,
    hidden: true,
    moveMs: 0,
    durationMs: RECORD_DWELL_MS,
  },
  {
    pageItemId: COMPANIES,
    showRecord: true,
    target: { kind: 'rail', id: PEOPLE },
    clicking: false,
    hidden: false,
    moveMs: 0,
    durationMs: 700,
  },
  {
    pageItemId: COMPANIES,
    showRecord: true,
    target: { kind: 'rail', id: PEOPLE },
    clicking: true,
    hidden: false,
    moveMs: 0,
    durationMs: 480,
  },
  {
    pageItemId: PEOPLE,
    showRecord: false,
    target: { kind: 'rail', id: PEOPLE },
    clicking: false,
    hidden: false,
    moveMs: 0,
    durationMs: 2200,
  },
  {
    pageItemId: PEOPLE,
    showRecord: false,
    target: { kind: 'rail', id: NOTES },
    clicking: false,
    hidden: false,
    moveMs: 700,
    durationMs: 900,
  },
  {
    pageItemId: PEOPLE,
    showRecord: false,
    target: { kind: 'rail', id: NOTES },
    clicking: true,
    hidden: false,
    moveMs: 0,
    durationMs: 480,
  },
  {
    pageItemId: NOTES,
    showRecord: false,
    target: { kind: 'rail', id: NOTES },
    clicking: false,
    hidden: false,
    moveMs: 0,
    durationMs: 2400,
  },
  {
    pageItemId: NOTES,
    showRecord: false,
    target: { kind: 'rail', id: COMPANIES },
    clicking: false,
    hidden: false,
    moveMs: 700,
    durationMs: 900,
  },
  {
    pageItemId: NOTES,
    showRecord: false,
    target: { kind: 'rail', id: COMPANIES },
    clicking: true,
    hidden: false,
    moveMs: 0,
    durationMs: 480,
  },
];

export function useProductHeroCursorAutoplay(
  enabled: boolean,
): ProductHeroTourState {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setPhaseIndex((current) =>
        current >= PHASES.length - 1 ? LOOP_START_INDEX : current + 1,
      );
    }, PHASES[phaseIndex].durationMs);

    return () => clearTimeout(timer);
  }, [enabled, phaseIndex]);

  const { clicking, hidden, moveMs, pageItemId, showRecord, target } =
    PHASES[phaseIndex];

  return { clicking, hidden, moveMs, pageItemId, showRecord, target };
}
