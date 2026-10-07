import { isDefined } from 'twenty-shared/utils';

import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';

// The step's agent acts with the run's permissions, derived again each time the agent continues
export const buildWorkflowAgentRunExecutionContext = (
  executionContext: WorkflowExecutionContext,
): AgentRunExecutionContext => ({
  authContext: executionContext.authContext,
  actorContext: executionContext.isActingOnBehalfOfUser
    ? executionContext.initiator
    : undefined,
  userWorkspaceId:
    executionContext.authContext.type === 'user'
      ? executionContext.authContext.userWorkspaceId
      : null,
  rolePermissionConfig: executionContext.rolePermissionConfig,
  ...(isDefined(executionContext.application)
    ? {
        application: executionContext.application,
        additionalRoleRestrictionIds: getRoleIdsFromRolePermissionConfig(
          executionContext.rolePermissionConfig,
        ),
      }
    : {}),
});
