import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';

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
  userWorkspaceId:
    executionContext.authContext.type === 'user'
      ? executionContext.authContext.userWorkspaceId
      : null,
  rolePermissionConfig: executionContext.rolePermissionConfig,
  usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
  ...(isDefined(executionContext.application)
    ? {
        application: executionContext.application,
        additionalRoleRestrictionIds: getRoleIdsFromRolePermissionConfig(
          executionContext.rolePermissionConfig,
        ),
      }
    : {}),
});
