import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { resolveRowLevelPermissionRoleIds } from 'src/engine/twenty-orm/utils/resolve-row-level-permission-role-ids.util';

const USER_WORKSPACE_ID = 'user-workspace-1';
const USER_ROLE_ID = 'user-role-1';
const AGENT_ROLE_ID = 'agent-role-1';
const APPLICATION_ROLE_ID = 'application-role-1';

const userWorkspaceRoleMap = { [USER_WORKSPACE_ID]: USER_ROLE_ID };
const apiKeyRoleMap = {};

const runAsMemberContext = {
  type: 'user',
  workspace: { id: 'workspace-1' },
  userWorkspaceId: USER_WORKSPACE_ID,
  user: { id: 'user-1' },
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' },
  viaApplication: { defaultRoleId: APPLICATION_ROLE_ID },
} as unknown as WorkspaceAuthContext;

const applicationContext = {
  type: 'application',
  workspace: { id: 'workspace-1' },
  application: { defaultRoleId: APPLICATION_ROLE_ID },
} as unknown as WorkspaceAuthContext;

describe('resolveRowLevelPermissionRoleIds', () => {
  it('should resolve the auth context roles alone without a role permission config', () => {
    expect(
      resolveRowLevelPermissionRoleIds({
        authContext: runAsMemberContext,
        userWorkspaceRoleMap,
        apiKeyRoleMap,
      }),
    ).toEqual([USER_ROLE_ID]);
  });

  it('should add the intersection roles to the member role for a run-as agent', () => {
    expect(
      resolveRowLevelPermissionRoleIds({
        authContext: runAsMemberContext,
        userWorkspaceRoleMap,
        apiKeyRoleMap,
        rolePermissionConfig: {
          intersectionOf: [AGENT_ROLE_ID, USER_ROLE_ID],
        },
      }),
    ).toEqual([USER_ROLE_ID, AGENT_ROLE_ID]);
  });

  it('should list a role once when the auth context and the config both carry it', () => {
    expect(
      resolveRowLevelPermissionRoleIds({
        authContext: runAsMemberContext,
        userWorkspaceRoleMap,
        apiKeyRoleMap,
        rolePermissionConfig: { intersectionOf: [USER_ROLE_ID] },
      }),
    ).toEqual([USER_ROLE_ID]);
  });

  it('should add the agent role to the application role for an agent run without a member', () => {
    expect(
      resolveRowLevelPermissionRoleIds({
        authContext: applicationContext,
        userWorkspaceRoleMap,
        apiKeyRoleMap,
        rolePermissionConfig: { intersectionOf: [AGENT_ROLE_ID] },
      }),
    ).toEqual([APPLICATION_ROLE_ID, AGENT_ROLE_ID]);
  });

  it('should ignore a union config', () => {
    expect(
      resolveRowLevelPermissionRoleIds({
        authContext: runAsMemberContext,
        userWorkspaceRoleMap,
        apiKeyRoleMap,
        rolePermissionConfig: { unionOf: [AGENT_ROLE_ID] },
      }),
    ).toEqual([USER_ROLE_ID]);
  });

  it('should ignore a bypass config', () => {
    expect(
      resolveRowLevelPermissionRoleIds({
        authContext: runAsMemberContext,
        userWorkspaceRoleMap,
        apiKeyRoleMap,
        rolePermissionConfig: { shouldBypassPermissionChecks: true },
      }),
    ).toEqual([USER_ROLE_ID]);
  });
});
