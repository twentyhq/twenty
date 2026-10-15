import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';

export const getWorkflowRunUserWorkspaceId = ({
  authContext,
}: Pick<WorkflowExecutionContext, 'authContext'>): string | null =>
  authContext.type === 'user' ? authContext.userWorkspaceId : null;
