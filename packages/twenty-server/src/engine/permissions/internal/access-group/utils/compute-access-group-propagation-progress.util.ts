/* @license Enterprise */

import { ACCESS_GROUP_PROPAGATION_PROGRESS_SYNC_UNIT } from 'src/engine/permissions/internal/access-group/constants/access-group-propagation-progress-sync-unit.constant';
import { type AccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-progress.type';

const REMAINING_FIELD_PREFIX = 'remaining:';

export const computeAccessGroupPropagationProgress = (
  progressFields: Record<string, string>,
): AccessGroupPropagationProgress => {
  let impactedRecordCount = 0;
  let remainingRecordCount = 0;
  let isSyncPending = false;

  for (const [field, value] of Object.entries(progressFields)) {
    if (!field.startsWith(REMAINING_FIELD_PREFIX)) {
      continue;
    }

    const unit = field.slice(REMAINING_FIELD_PREFIX.length);
    const remaining = Math.max(0, Number(value));

    if (unit === ACCESS_GROUP_PROPAGATION_PROGRESS_SYNC_UNIT) {
      isSyncPending = remaining > 0;
      continue;
    }

    const total = Math.max(0, Number(progressFields[`total:${unit}`] ?? 0));

    impactedRecordCount += total;
    remainingRecordCount += Math.min(remaining, total);
  }

  return {
    impactedRecordCount,
    remainingRecordCount,
    isInProgress: isSyncPending || remainingRecordCount > 0,
  };
};
