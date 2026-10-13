import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  type ORMWorkspaceContext,
  withWorkspaceContext,
} from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildEmailingRolePermissionConfig } from 'src/modules/emailing/utils/build-emailing-role-permission-config.util';

const USER_ROLE_ID = 'user-role-1';
const APPLICATION_ROLE_ID = 'application-role-1';
const AGENT_ID = 'agent-1';
const AGENT_ROLE_ID = 'agent-role-1';

const buildWithin = (authContext: Partial<WorkspaceAuthContext>) =>
  withWorkspaceContext(
    {
      authContext: {
        type: 'user',
        workspace: { id: 'workspace-1' },
        ...authContext,
      },
      flatRoleTargetByAgentIdMaps: { [AGENT_ID]: { roleId: AGENT_ROLE_ID } },
    } as unknown as ORMWorkspaceContext,
    () => buildEmailingRolePermissionConfig(USER_ROLE_ID),
  );

describe('buildEmailingRolePermissionConfig', () => {
  it('should bound the member role by the application acting for the member', () => {
    expect(
      buildWithin({
        application: { defaultRoleId: APPLICATION_ROLE_ID },
      } as Partial<WorkspaceAuthContext>),
    ).toEqual({
      intersectionOf: {
        userWorkspaceRoleId: USER_ROLE_ID,
        applicationRoleId: APPLICATION_ROLE_ID,
      },
    });
  });

  it('should narrow a token carrying an agent to the agent role', () => {
    expect(
      buildWithin({
        application: { defaultRoleId: APPLICATION_ROLE_ID },
        agentId: AGENT_ID,
      } as Partial<WorkspaceAuthContext>),
    ).toEqual({
      intersectionOf: {
        userWorkspaceRoleId: USER_ROLE_ID,
        applicationRoleId: APPLICATION_ROLE_ID,
        agentRoleId: AGENT_ROLE_ID,
      },
    });
  });

  it('should deny a token whose agent has no role', () => {
    expect(
      buildWithin({
        agentId: 'agent-without-role',
      } as Partial<WorkspaceAuthContext>),
    ).toEqual({
      intersectionOf: {
        userWorkspaceRoleId: USER_ROLE_ID,
        agentRoleId: null,
      },
    });
  });
});
