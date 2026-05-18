import type { FileChange } from './file-change-type';

export const CHANGES_SUMMARY_COLLAPSED_FILE_COUNT = 3;
export const CHANGES_SUMMARY_ROW_BASE_DELAY_MS = 40;
export const CHANGES_SUMMARY_ROW_STAGGER_MS = 24;

export const getHiddenChangesCount = ({
  changes,
  collapsedFileCount = CHANGES_SUMMARY_COLLAPSED_FILE_COUNT,
}: {
  changes: ReadonlyArray<FileChange>;
  collapsedFileCount?: number;
}): number => Math.max(changes.length - collapsedFileCount, 0);

export const getVisibleChanges = ({
  changes,
  collapsedFileCount = CHANGES_SUMMARY_COLLAPSED_FILE_COUNT,
  isExpanded,
}: {
  changes: ReadonlyArray<FileChange>;
  collapsedFileCount?: number;
  isExpanded: boolean;
}): ReadonlyArray<FileChange> =>
  isExpanded || getHiddenChangesCount({ changes, collapsedFileCount }) === 0
    ? changes
    : changes.slice(0, collapsedFileCount);

export const getChangesSummaryRowDelay = (index: number): string =>
  `${CHANGES_SUMMARY_ROW_BASE_DELAY_MS + index * CHANGES_SUMMARY_ROW_STAGGER_MS}ms`;
