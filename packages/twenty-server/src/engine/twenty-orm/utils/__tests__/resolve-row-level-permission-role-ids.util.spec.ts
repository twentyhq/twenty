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

const ROLELESS_APPLICATION_AUTH_CONTEXT = {
  type: 'application',
  workspace: { id: 'workspace-1' },
  application: { defaultRoleId: null },
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

  it('should resolve every role of an explicit intersection', () => {
    expect(
      resolve({
        authContext: USER_AUTH_CONTEXT,
        rolePermissionConfig: {
          intersectionOf: [AGENT_ROLE_ID, USER_ROLE_ID, APPLICATION_ROLE_ID],
        },
      }),
    ).toEqual([AGENT_ROLE_ID, USER_ROLE_ID, APPLICATION_ROLE_ID]);
  });

  it('should not add auth context roles the intersection leaves out', () => {
    expect(
      resolve({
        authContext: APPLICATION_AUTH_CONTEXT,
        rolePermissionConfig: { intersectionOf: [AGENT_ROLE_ID, USER_ROLE_ID] },
      }),
    ).toEqual([AGENT_ROLE_ID, USER_ROLE_ID]);
  });

  it('should still apply the intersection when the auth context resolves no role', () => {
    expect(
      resolve({
        authContext: ROLELESS_APPLICATION_AUTH_CONTEXT,
        rolePermissionConfig: { intersectionOf: [AGENT_ROLE_ID] },
      }),
    ).toEqual([AGENT_ROLE_ID]);
  });

  it('should resolve a repeated intersected role once', () => {
    expect(
      resolve({
        authContext: USER_AUTH_CONTEXT,
        rolePermissionConfig: { intersectionOf: [USER_ROLE_ID, USER_ROLE_ID] },
      }),
    ).toEqual([USER_ROLE_ID]);
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
