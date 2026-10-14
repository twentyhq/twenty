import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { resolveRoleIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-role-ids-from-auth-context.util';

const USER_WORKSPACE_ID = 'user-workspace-1';
const USER_ROLE_ID = 'user-role-1';
const APPLICATION_ROLE_ID = 'application-role-1';
const API_KEY_ID = 'api-key-1';
const API_KEY_ROLE_ID = 'api-key-role-1';

const userWorkspaceRoleMap = { [USER_WORKSPACE_ID]: USER_ROLE_ID };
const apiKeyRoleMap = { [API_KEY_ID]: API_KEY_ROLE_ID };

const buildUserContext = (application?: {
  defaultRoleId: string | null;
}): WorkspaceAuthContext =>
  ({
    type: 'user',
    workspace: { id: 'workspace-1' },
    userWorkspaceId: USER_WORKSPACE_ID,
    user: { id: 'user-1' },
    workspaceMemberId: 'workspace-member-1',
    workspaceMember: { id: 'workspace-member-1' },
    ...(application ? { application } : {}),
  }) as unknown as WorkspaceAuthContext;

const resolve = (authContext: WorkspaceAuthContext) =>
  resolveRoleIdsFromAuthContext({
    authContext,
    userWorkspaceRoleMap,
    apiKeyRoleMap,
  });

describe('resolveRoleIdsFromAuthContext', () => {
  it('should resolve the user role alone for a plain user request', () => {
    expect(resolve(buildUserContext())).toEqual([USER_ROLE_ID]);
  });

  it('should resolve both roles when an application acts on the user behalf', () => {
    expect(
      resolve(buildUserContext({ defaultRoleId: APPLICATION_ROLE_ID })),
    ).toEqual([USER_ROLE_ID, APPLICATION_ROLE_ID]);
  });

  it('should add no bound when the application declares no role', () => {
    expect(resolve(buildUserContext({ defaultRoleId: null }))).toEqual([
      USER_ROLE_ID,
    ]);
  });

  it('should resolve the role once when the application declares the user own role', () => {
    expect(resolve(buildUserContext({ defaultRoleId: USER_ROLE_ID }))).toEqual([
      USER_ROLE_ID,
    ]);
  });

  it('should ignore viaApplication: run-as provenance never narrows permissions', () => {
    const runAsContext = {
      ...buildUserContext(),
      viaApplication: { defaultRoleId: APPLICATION_ROLE_ID },
    } as WorkspaceAuthContext;

    expect(resolve(runAsContext)).toEqual([USER_ROLE_ID]);
  });

  it('should resolve nothing when the user has no role, even with an application', () => {
    const contextWithUnknownUserWorkspace = {
      ...buildUserContext({ defaultRoleId: APPLICATION_ROLE_ID }),
      userWorkspaceId: 'unknown-user-workspace',
    } as WorkspaceAuthContext;

    expect(resolve(contextWithUnknownUserWorkspace)).toEqual([]);
  });

  it('should resolve the api key role', () => {
    expect(
      resolve({
        type: 'apiKey',
        workspace: { id: 'workspace-1' },
        apiKey: { id: API_KEY_ID },
      } as unknown as WorkspaceAuthContext),
    ).toEqual([API_KEY_ROLE_ID]);
  });

  it('should resolve the application role for an application-only request', () => {
    expect(
      resolve({
        type: 'application',
        workspace: { id: 'workspace-1' },
        application: { defaultRoleId: APPLICATION_ROLE_ID },
      } as unknown as WorkspaceAuthContext),
    ).toEqual([APPLICATION_ROLE_ID]);
  });

  it('should resolve nothing for an application-only request with no declared role', () => {
    expect(
      resolve({
        type: 'application',
        workspace: { id: 'workspace-1' },
        application: { defaultRoleId: null },
      } as unknown as WorkspaceAuthContext),
    ).toEqual([]);
  });

  it('should resolve nothing for a system request', () => {
    expect(
      resolve({
        type: 'system',
        workspace: { id: 'workspace-1' },
      } as unknown as WorkspaceAuthContext),
    ).toEqual([]);
  });
});
