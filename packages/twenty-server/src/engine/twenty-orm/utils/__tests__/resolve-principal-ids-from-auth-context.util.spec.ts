import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { resolvePrincipalIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-principal-ids-from-auth-context.util';

const USER_WORKSPACE_ID = 'user-workspace-1';
const USER_ROLE_ID = 'user-role-1';
const WORKSPACE_MEMBER_ID = 'workspace-member-1';
const APPLICATION_ROLE_ID = 'application-role-1';
const API_KEY_ID = 'api-key-1';
const API_KEY_ROLE_ID = 'api-key-role-1';

const userWorkspaceRoleMap = { [USER_WORKSPACE_ID]: USER_ROLE_ID };
const apiKeyRoleMap = { [API_KEY_ID]: API_KEY_ROLE_ID };

const AGENT_ROLE_ID = 'agent-role-1';

const resolve = (
  authContext: WorkspaceAuthContext,
  rolePermissionConfig?: RolePermissionConfig,
) =>
  resolvePrincipalIdsFromAuthContext({
    authContext,
    userWorkspaceRoleMap,
    apiKeyRoleMap,
    rolePermissionConfig,
  });

const USER_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: 'workspace-1' },
  userWorkspaceId: USER_WORKSPACE_ID,
  user: { id: 'user-1' },
  workspaceMemberId: WORKSPACE_MEMBER_ID,
  workspaceMember: { id: WORKSPACE_MEMBER_ID },
} as unknown as WorkspaceAuthContext;

describe('resolvePrincipalIdsFromAuthContext', () => {
  it('should resolve everyone, the workspace member and the role for a user', () => {
    expect(
      resolve({
        type: 'user',
        workspace: { id: 'workspace-1' },
        userWorkspaceId: USER_WORKSPACE_ID,
        user: { id: 'user-1' },
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        workspaceMember: { id: WORKSPACE_MEMBER_ID },
      } as unknown as WorkspaceAuthContext),
    ).toEqual([EVERYONE_PRINCIPAL_ID, WORKSPACE_MEMBER_ID, USER_ROLE_ID]);
  });

  it('should add the application role when an application acts on the user behalf', () => {
    expect(
      resolve({
        type: 'user',
        workspace: { id: 'workspace-1' },
        userWorkspaceId: USER_WORKSPACE_ID,
        user: { id: 'user-1' },
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        workspaceMember: { id: WORKSPACE_MEMBER_ID },
        application: { defaultRoleId: APPLICATION_ROLE_ID },
      } as unknown as WorkspaceAuthContext),
    ).toEqual([
      EVERYONE_PRINCIPAL_ID,
      WORKSPACE_MEMBER_ID,
      USER_ROLE_ID,
      APPLICATION_ROLE_ID,
    ]);
  });

  it('should resolve everyone alone for a user without a role', () => {
    expect(
      resolve({
        type: 'user',
        workspace: { id: 'workspace-1' },
        userWorkspaceId: 'unknown-user-workspace',
        user: { id: 'user-1' },
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        workspaceMember: { id: WORKSPACE_MEMBER_ID },
      } as unknown as WorkspaceAuthContext),
    ).toEqual([EVERYONE_PRINCIPAL_ID, WORKSPACE_MEMBER_ID]);
  });

  it('should resolve everyone and the api key role for an api key', () => {
    expect(
      resolve({
        type: 'apiKey',
        workspace: { id: 'workspace-1' },
        apiKey: { id: API_KEY_ID },
      } as unknown as WorkspaceAuthContext),
    ).toEqual([EVERYONE_PRINCIPAL_ID, API_KEY_ROLE_ID]);
  });

  it('should resolve everyone and the application role for an application', () => {
    expect(
      resolve({
        type: 'application',
        workspace: { id: 'workspace-1' },
        application: {
          id: 'application-1',
          defaultRoleId: APPLICATION_ROLE_ID,
        },
      } as unknown as WorkspaceAuthContext),
    ).toEqual([EVERYONE_PRINCIPAL_ID, APPLICATION_ROLE_ID]);
  });

  it('should resolve everyone alone for a pending activation user', () => {
    expect(
      resolve({
        type: 'pendingActivationUser',
        workspace: { id: 'workspace-1' },
        userWorkspaceId: USER_WORKSPACE_ID,
        user: { id: 'user-1' },
      } as unknown as WorkspaceAuthContext),
    ).toEqual([EVERYONE_PRINCIPAL_ID]);
  });

  it('should resolve no gate for a system request', () => {
    expect(
      resolve({
        type: 'system',
        workspace: { id: 'workspace-1' },
      } as unknown as WorkspaceAuthContext),
    ).toBeUndefined();
  });

  it('should not hold the shares of the application a member is run as by', () => {
    expect(
      resolve({
        ...USER_AUTH_CONTEXT,
        viaApplication: { defaultRoleId: APPLICATION_ROLE_ID },
      } as WorkspaceAuthContext),
    ).toEqual([EVERYONE_PRINCIPAL_ID, WORKSPACE_MEMBER_ID, USER_ROLE_ID]);
  });

  it('should keep only everyone and the member under an intersection of several roles', () => {
    expect(
      resolve(USER_AUTH_CONTEXT, {
        intersectionOf: [AGENT_ROLE_ID, USER_ROLE_ID, APPLICATION_ROLE_ID],
      }),
    ).toEqual([EVERYONE_PRINCIPAL_ID, WORKSPACE_MEMBER_ID]);
  });

  it('should keep the shares of a lone intersected role', () => {
    expect(
      resolve(USER_AUTH_CONTEXT, {
        intersectionOf: [USER_ROLE_ID, USER_ROLE_ID],
      }),
    ).toEqual([EVERYONE_PRINCIPAL_ID, WORKSPACE_MEMBER_ID, USER_ROLE_ID]);
  });

  it('should take the lone intersected role over the auth context roles', () => {
    expect(
      resolve(
        {
          type: 'application',
          workspace: { id: 'workspace-1' },
          application: { id: 'application-1', defaultRoleId: null },
        } as unknown as WorkspaceAuthContext,
        { intersectionOf: [AGENT_ROLE_ID] },
      ),
    ).toEqual([EVERYONE_PRINCIPAL_ID, AGENT_ROLE_ID]);
  });

  it('should keep the auth context roles for a union config', () => {
    expect(resolve(USER_AUTH_CONTEXT, { unionOf: [AGENT_ROLE_ID] })).toEqual([
      EVERYONE_PRINCIPAL_ID,
      WORKSPACE_MEMBER_ID,
      USER_ROLE_ID,
    ]);
  });
});
