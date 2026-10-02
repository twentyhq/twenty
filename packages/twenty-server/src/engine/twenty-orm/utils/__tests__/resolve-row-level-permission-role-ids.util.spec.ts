import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { resolveRowLevelPermissionRoleIds } from 'src/engine/twenty-orm/utils/resolve-row-level-permission-role-ids.util';

const USER_WORKSPACE_ID = 'user-workspace-1';
const USER_ROLE_ID = 'user-role-1';
const APPLICATION_ROLE_ID = 'application-role-1';
const AGENT_ROLE_ID = 'agent-role-1';

const USER_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: 'workspace-1' },
  userWorkspaceId: USER_WORKSPACE_ID,
  user: { id: 'user-1' },
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' },
} as unknown as WorkspaceAuthContext;

const APPLICATION_AUTH_CONTEXT = {
  type: 'application',
  workspace: { id: 'workspace-1' },
  application: { defaultRoleId: APPLICATION_ROLE_ID },
} as unknown as WorkspaceAuthContext;

const resolve = ({
  authContext,
  rolePermissionConfig,
}: {
  authContext: WorkspaceAuthContext;
  rolePermissionConfig?: RolePermissionConfig;
}) =>
  resolveRowLevelPermissionRoleIds({
    authContext,
    userWorkspaceRoleMap: { [USER_WORKSPACE_ID]: USER_ROLE_ID },
    apiKeyRoleMap: {},
    rolePermissionConfig,
  });

describe('resolveRowLevelPermissionRoleIds', () => {
  it('should resolve the auth context roles without an explicit config', () => {
    expect(resolve({ authContext: USER_AUTH_CONTEXT })).toEqual([USER_ROLE_ID]);
  });

  it('should add every role of an explicit intersection to the auth context roles', () => {
    expect(
      resolve({
        authContext: APPLICATION_AUTH_CONTEXT,
        rolePermissionConfig: {
          intersectionOf: [AGENT_ROLE_ID, APPLICATION_ROLE_ID],
        },
      }),
    ).toEqual([APPLICATION_ROLE_ID, AGENT_ROLE_ID]);
  });

  it('should keep the auth context roles when the intersection does not name them', () => {
    expect(
      resolve({
        authContext: USER_AUTH_CONTEXT,
        rolePermissionConfig: { intersectionOf: [AGENT_ROLE_ID] },
      }),
    ).toEqual([USER_ROLE_ID, AGENT_ROLE_ID]);
  });

  it('should ignore a union config', () => {
    expect(
      resolve({
        authContext: USER_AUTH_CONTEXT,
        rolePermissionConfig: { unionOf: [AGENT_ROLE_ID] },
      }),
    ).toEqual([USER_ROLE_ID]);
  });

  it('should ignore a bypass config', () => {
    expect(
      resolve({
        authContext: USER_AUTH_CONTEXT,
        rolePermissionConfig: { shouldBypassPermissionChecks: true },
      }),
    ).toEqual([USER_ROLE_ID]);
  });
});
