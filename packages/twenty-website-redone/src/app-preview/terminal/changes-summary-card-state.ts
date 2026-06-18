import { type FileChange } from './rocket-changeset';

const COLLAPSED_FILE_COUNT = 3;
const ROW_BASE_DELAY_MS = 40;
const ROW_STAGGER_MS = 24;

const getHiddenChangesCount = ({
  changes,
  collapsedFileCount = COLLAPSED_FILE_COUNT,
}: {
  changes: ReadonlyArray<FileChange>;
  collapsedFileCount?: number;
}): number => Math.max(changes.length - collapsedFileCount, 0);

const getVisibleChanges = ({
  changes,
  collapsedFileCount = COLLAPSED_FILE_COUNT,
  isExpanded,
}: {
  changes: ReadonlyArray<FileChange>;
  collapsedFileCount?: number;
  isExpanded: boolean;
}): ReadonlyArray<FileChange> =>
  isExpanded || getHiddenChangesCount({ changes, collapsedFileCount }) === 0
    ? changes
    : changes.slice(0, collapsedFileCount);

const getRowDelay = (index: number): string =>
  `${ROW_BASE_DELAY_MS + index * ROW_STAGGER_MS}ms`;

export const changesSummaryCardState = {
  collapsedFileCount: COLLAPSED_FILE_COUNT,
  getHiddenChangesCount,
  getRowDelay,
  getVisibleChanges,
};
