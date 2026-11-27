/* @license Enterprise */

import { type AccessGroupComputePlanStep } from 'src/engine/permissions/internal/access-group/types/access-group-compute-plan-step.type';

export const computeAccessGroupPropagationRecordCounts = (
  objectComputes: Pick<
    AccessGroupComputePlanStep,
    'plannedRecordCount' | 'computedRecordCount' | 'isComputed'
  >[],
): { totalRecordCount: number; remainingRecordCount: number } =>
  objectComputes.reduce(
    (recordCounts, { plannedRecordCount, computedRecordCount, isComputed }) => {
      const totalRecordCount = Math.max(
        plannedRecordCount,
        computedRecordCount,
      );

      return {
        totalRecordCount: recordCounts.totalRecordCount + totalRecordCount,
        remainingRecordCount:
          recordCounts.remainingRecordCount +
          (isComputed ? 0 : totalRecordCount - computedRecordCount),
      };
    },
    { totalRecordCount: 0, remainingRecordCount: 0 },
  );
