import { type WorkflowCoreConsistencyResult } from 'src/modules/workflow/workflow-core-consistency/services/workflow-core-consistency.service';

// A workspace is safe to cut over only when every drift counter is zero;
// null means the workspace has no workflows at all, which is also safe
export const flattenWorkflowCoreDrift = (
  result: WorkflowCoreConsistencyResult | null,
): string[] => {
  if (result === null) {
    return [];
  }

  return Object.entries(result).flatMap(([entity, counts]) =>
    Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([driftType, count]) => `${entity}.${driftType}=${count}`),
  );
};
