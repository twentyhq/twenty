import { FieldActorSource } from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { buildWorkflowAgentRunExecutionContext } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-workflow-agent-run-execution-context.util';

const initiator = {
  source: FieldActorSource.MANUAL,
  workspaceMemberId: 'workspace-member-id',
  name: 'Member',
  context: {},
};

const application = {
  id: 'application-id',
  defaultRoleId: 'application-role-id',
} as FlatApplication;

const buildExecutionContext = ({
  rolePermissionConfig,
  application = null,
}: {
  rolePermissionConfig: RolePermissionConfig;
  application?: FlatApplication | null;
}): WorkflowExecutionContext => ({
  isActingOnBehalfOfUser: true,
  initiator,
  rolePermissionConfig,
  authContext: {
    type: 'user',
    userWorkspaceId: 'user-workspace-id',
  } as WorkspaceAuthContext,
  application,
});

describe('buildWorkflowAgentRunExecutionContext', () => {
  it('narrows the agent to the member on a manual run without an application', () => {
    const agentExecutionContext = buildWorkflowAgentRunExecutionContext({
      executionContext: buildExecutionContext({
        rolePermissionConfig: {
          intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
        },
      }),
      turnCreatedBy: initiator,
    });

    expect(agentExecutionContext.agentRunRoleIds).toEqual({
      userWorkspaceRoleId: 'member-role-id',
    });
    expect(agentExecutionContext).not.toHaveProperty('application');
  });

  it('adds no restriction for a run that bypasses permission checks', () => {
    const agentExecutionContext = buildWorkflowAgentRunExecutionContext({
      executionContext: buildExecutionContext({
        rolePermissionConfig: { shouldBypassPermissionChecks: true },
      }),
      turnCreatedBy: initiator,
    });

    expect(agentExecutionContext.agentRunRoleIds).toEqual({});
    expect(agentExecutionContext).not.toHaveProperty('application');
  });

  it('narrows the agent to the member and the application on a run with an application', () => {
    const agentExecutionContext = buildWorkflowAgentRunExecutionContext({
      executionContext: buildExecutionContext({
        rolePermissionConfig: {
          intersectionOf: {
            userWorkspaceRoleId: 'member-role-id',
            applicationRoleId: 'application-role-id',
            agentRoleId: 'ignored-agent-role-id',
          },
        },
        application,
      }),
      turnCreatedBy: initiator,
    });

    expect(agentExecutionContext.agentRunRoleIds).toEqual({
      userWorkspaceRoleId: 'member-role-id',
      applicationRoleId: 'application-role-id',
    });
    expect(agentExecutionContext.application).toBe(application);
  });
});
