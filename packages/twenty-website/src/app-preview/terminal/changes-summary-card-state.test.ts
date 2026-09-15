import { changesSummaryCardState } from './changes-summary-card-state';
import { type FileChange } from './rocket-changeset';

const changes: FileChange[] = [
  { added: 10, path: 'one.ts', removed: 0 },
  { added: 20, path: 'two.ts', removed: 1 },
  { added: 30, path: 'three.ts', removed: 2 },
  { added: 40, path: 'four.ts', removed: 3 },
];

describe('changesSummaryCardState', () => {
  it('should compute the number of hidden collapsed changes', () => {
    expect(
      changesSummaryCardState.getHiddenChangesCount({
        changes,
        collapsedFileCount: 3,
      }),
    ).toEqual(1);

    expect(
      changesSummaryCardState.getHiddenChangesCount({
        changes: changes.slice(0, 2),
        collapsedFileCount: 3,
      }),
    ).toEqual(0);
  });

  it('should return collapsed or expanded visible changes deterministically', () => {
    expect(
      changesSummaryCardState.getVisibleChanges({
        changes,
        collapsedFileCount: 2,
        isExpanded: false,
      }),
    ).toEqual(changes.slice(0, 2));

    expect(
      changesSummaryCardState.getVisibleChanges({
        changes,
        collapsedFileCount: 2,
        isExpanded: true,
      }),
    ).toBe(changes);
  });

  it('should compute stable row animation delays', () => {
    expect(changesSummaryCardState.getRowDelay(0)).toBe('40ms');
    expect(changesSummaryCardState.getRowDelay(3)).toBe('112ms');
  });
});
