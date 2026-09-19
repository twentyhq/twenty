import { isDefined } from 'twenty-shared/utils';

import { type AfterCommitSideEffect } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/after-commit-side-effect.type';

export const deduplicateAfterCommitSideEffects = (
  afterCommitSideEffects: AfterCommitSideEffect[],
): AfterCommitSideEffect[] => {
  const seenDeduplicationKeys = new Set<string>();

  return afterCommitSideEffects.filter(({ deduplicationKey }) => {
    if (!isDefined(deduplicationKey)) {
      return true;
    }

    if (seenDeduplicationKeys.has(deduplicationKey)) {
      return false;
    }

    seenDeduplicationKeys.add(deduplicationKey);

    return true;
  });
};
