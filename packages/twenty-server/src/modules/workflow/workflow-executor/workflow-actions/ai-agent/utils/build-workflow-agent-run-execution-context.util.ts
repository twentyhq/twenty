import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type AgentRunRoleIds } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-role-ids.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { getWorkflowRunUserWorkspaceId } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/get-workflow-run-user-workspace-id.util';

// A run that bypasses permission checks adds no restriction to the agent's role
const getAgentRunRoleIdsFromRolePermissionConfig = (
  rolePermissionConfig: RolePermissionConfig,
): AgentRunRoleIds => {
  if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
    return {};
  }

  const { agentRoleId: _agentRoleId, ...agentRunRoleIds } =
    rolePermissionConfig.intersectionOf;

  return agentRunRoleIds;
};

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
  rolePermissionConfig: executionContext.rolePermissionConfig,
  usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
  agentRunRoleIds: getAgentRunRoleIdsFromRolePermissionConfig(
    executionContext.rolePermissionConfig,
  ),
  ...(isDefined(executionContext.application)
    ? { application: executionContext.application }
    : {}),
});
