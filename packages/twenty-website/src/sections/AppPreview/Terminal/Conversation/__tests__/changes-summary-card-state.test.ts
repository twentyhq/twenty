import {
  getChangesSummaryRowDelay,
  getHiddenChangesCount,
  getVisibleChanges,
} from '../utils/changes-summary-card-state';
import type { FileChange } from '../utils/file-change-type';

const changes: FileChange[] = [
  { added: 10, path: 'one.ts', removed: 0 },
  { added: 20, path: 'two.ts', removed: 1 },
  { added: 30, path: 'three.ts', removed: 2 },
  { added: 40, path: 'four.ts', removed: 3 },
];

describe('changes-summary-card-state', () => {
  it('computes the number of hidden collapsed changes', () => {
    expect(getHiddenChangesCount({ changes, collapsedFileCount: 3 })).toEqual(
      1,
    );

    expect(
      getHiddenChangesCount({
        changes: changes.slice(0, 2),
        collapsedFileCount: 3,
      }),
    ).toEqual(0);
  });

  it('returns collapsed or expanded visible changes deterministically', () => {
    expect(
      getVisibleChanges({
        changes,
        collapsedFileCount: 2,
        isExpanded: false,
      }),
    ).toEqual(changes.slice(0, 2));

    expect(
      getVisibleChanges({
        changes,
        collapsedFileCount: 2,
        isExpanded: true,
      }),
    ).toBe(changes);
  });

  it('computes stable row animation delays', () => {
    expect(getChangesSummaryRowDelay(0)).toBe('40ms');
    expect(getChangesSummaryRowDelay(3)).toBe('112ms');
  });
});
