export const getWorkflowUsageSpenderId = ({
  id,
  workspaceWorkflowId,
}: {
  id: string;
  workspaceWorkflowId: string | null;
}): string => workspaceWorkflowId ?? id;
