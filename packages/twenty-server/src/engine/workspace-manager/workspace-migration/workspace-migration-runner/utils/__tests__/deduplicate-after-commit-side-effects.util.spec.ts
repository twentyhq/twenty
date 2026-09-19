import { type AfterCommitSideEffect } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/after-commit-side-effect.type';
import { deduplicateAfterCommitSideEffects } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/deduplicate-after-commit-side-effects.util';

const buildSideEffect = (
  description: string,
  deduplicationKey?: string,
): AfterCommitSideEffect => ({
  description,
  deduplicationKey,
  run: async () => {},
});

describe('deduplicateAfterCommitSideEffects', () => {
  it('should keep the first side effect of each deduplication key', () => {
    const result = deduplicateAfterCommitSideEffects([
      buildSideEffect('first enqueue', 'workspace-a'),
      buildSideEffect('second enqueue', 'workspace-a'),
      buildSideEffect('other workspace enqueue', 'workspace-b'),
    ]);

    expect(result.map(({ description }) => description)).toEqual([
      'first enqueue',
      'other workspace enqueue',
    ]);
  });

  it('should keep every side effect without a deduplication key', () => {
    const result = deduplicateAfterCommitSideEffects([
      buildSideEffect('delete file a'),
      buildSideEffect('delete file b'),
    ]);

    expect(result.map(({ description }) => description)).toEqual([
      'delete file a',
      'delete file b',
    ]);
  });
});
