import { type ActorMetadata } from 'twenty-shared/types';

import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { getWorkflowRunUserWorkspaceId } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/get-workflow-run-user-workspace-id.util';

// The step's agent acts with the run's permissions, derived again each time the agent continues
export const buildWorkflowAgentRunExecutionContext = ({
  executionContext,
  turnCreatedBy,
}: {
  executionContext: WorkflowExecutionContext;
  turnCreatedBy: ActorMetadata;
}): AgentRunExecutionContext => ({
  authContext: executionContext.authContext,
  actorContext: executionContext.isActingOnBehalfOfUser
    ? executionContext.initiator
    : undefined,
  turnCreatedBy,
  userWorkspaceId: getWorkflowRunUserWorkspaceId(executionContext),
});
