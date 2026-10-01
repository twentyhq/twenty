export type ApplicationWorkflowUpdateConflict = {
  workflowName: string;
  workflowRunCount: number;
  blockedChanges: string[];
};
