export type CachedCronTrigger = {
  workspaceId: string;
  workflowId: string;
  legacyWorkflowId?: string;
  coreWorkflowVersionId: string;
  pattern: string;
};
