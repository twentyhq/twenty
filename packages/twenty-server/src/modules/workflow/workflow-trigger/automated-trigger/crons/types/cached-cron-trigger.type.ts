export type CachedCronTrigger = {
  workspaceId: string;
  workflowId: string;
  coreWorkflowVersionId?: string | null;
  workspaceWorkflowVersionId?: string | null;
  pattern: string;
};
