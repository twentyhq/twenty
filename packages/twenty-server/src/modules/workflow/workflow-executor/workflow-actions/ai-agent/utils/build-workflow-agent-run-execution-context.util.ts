import { type ActorMetadata } from 'twenty-shared/types';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { getWorkflowRunUserWorkspaceId } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/get-workflow-run-user-workspace-id.util';

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
  rolePermissionConfig: executionContext.rolePermissionConfig,
  usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
  application: executionContext.application,
});
