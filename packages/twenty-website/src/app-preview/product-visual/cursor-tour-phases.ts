import { PAGE_ITEM_IDS } from './page-item-ids';

export type CursorTarget =
  | { kind: 'home' }
  | { kind: 'row'; id: string }
  | { kind: 'rail'; id: string }
  | { kind: 'tab'; id: string };

export type TourPhase = {
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

const COMPANIES = PAGE_ITEM_IDS.companies;
const PEOPLE = PAGE_ITEM_IDS.people;
const NOTES = 'notes';
const RECORD_ROW_ID = 'anthropic';

const LOOP_START_INDEX = 0;

// Desktop tour — explores the record's Timeline/Notes/Calendar tabs.
const DESKTOP_PHASES: TourPhase[] = [
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

// Mobile tour — the three cursors strictly alternate (Alice -> Ben ->
// Cara) and only touch elements that fit a narrow window: the Companies
// list, the record Timeline tab, and the sidebar rails.
const MOBILE_PHASES: TourPhase[] = [
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
    durationMs: 1000,
  },
  {
    activeCursor: 1,
    pageItemId: COMPANIES,
    showRecord: true,
    recordTab: 'Timeline',
    target: { kind: 'rail', id: PEOPLE },
    clicking: false,
    hidden: false,
    durationMs: 900,
  },
  {
    activeCursor: 1,
    pageItemId: PEOPLE,
    showRecord: false,
    target: { kind: 'rail', id: PEOPLE },
    clicking: true,
    hidden: false,
    durationMs: 400,
  },
  {
    activeCursor: 2,
    pageItemId: PEOPLE,
    showRecord: false,
    target: { kind: 'home' },
    clicking: false,
    hidden: false,
    durationMs: 1000,
  },
  {
    activeCursor: 2,
    pageItemId: PEOPLE,
    showRecord: false,
    target: { kind: 'rail', id: COMPANIES },
    clicking: false,
    hidden: false,
    durationMs: 900,
  },
  {
    activeCursor: 2,
    pageItemId: COMPANIES,
    showRecord: false,
    target: { kind: 'rail', id: COMPANIES },
    clicking: true,
    hidden: false,
    durationMs: 400,
  },
];

// The tour replays from the top once the last phase's dwell elapses.
function nextPhaseIndex(current: number, phaseCount: number): number {
  return current >= phaseCount - 1 ? LOOP_START_INDEX : current + 1;
}

export const cursorTour = {
  DESKTOP_PHASES,
  MOBILE_PHASES,
  nextPhaseIndex,
};
