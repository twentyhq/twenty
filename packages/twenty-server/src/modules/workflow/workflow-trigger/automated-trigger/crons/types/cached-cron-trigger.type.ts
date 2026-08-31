export type CachedCronTrigger = {
  workspaceId: string;
  workflowId: string;
  coreWorkflowId?: string | null;
  coreWorkflowVersionId?: string | null;
  workspaceWorkflowVersionId?: string | null;
  pattern: string;
};
