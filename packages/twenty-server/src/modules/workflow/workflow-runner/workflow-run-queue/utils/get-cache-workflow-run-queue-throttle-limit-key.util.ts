export const getWorkflowRunQueueThrottleLimitKey = (
  workspaceId: string,
): string => `workflow-run-queue-throttle-limit:${workspaceId}`;
