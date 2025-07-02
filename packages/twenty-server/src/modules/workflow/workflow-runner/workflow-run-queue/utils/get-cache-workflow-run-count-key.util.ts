export const getWorkflowRunQueuedCountCacheKey = (
  workspaceId: string,
): string => `workflow-run-queued-count:${workspaceId}`;
