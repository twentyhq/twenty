export const getWorkflowRunNotStartedCountCacheKey = (
  workspaceId: string,
): string => `workflow-run-not-started-count:${workspaceId}`;
