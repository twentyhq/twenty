import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildBlocklistMutationContextOrThrow } from 'src/modules/blocklist/utils/build-blocklist-mutation-context-or-throw.util';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000002';
const WORKSPACE_MEMBER_ID = '20202020-0000-0000-0000-000000000003';
const APPLICATION_ID = '20202020-0000-0000-0000-000000000004';

const buildUserAuthContext = (application?: {
  id: string;
}): UserWorkspaceAuthContext =>
  ({
    type: 'user',
    workspace: { id: WORKSPACE_ID },
    userWorkspaceId: USER_WORKSPACE_ID,
    workspaceMemberId: WORKSPACE_MEMBER_ID,
    application,
  }) as UserWorkspaceAuthContext;

describe('buildBlocklistMutationContextOrThrow', () => {
  it('should carry the auth context of the member', () => {
    const authContext = buildUserAuthContext({ id: APPLICATION_ID });

    expect(buildBlocklistMutationContextOrThrow(authContext)).toEqual({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      authContext,
    });
  });

  it('should refuse a context with no member bound', () => {
    expect(() =>
      buildBlocklistMutationContextOrThrow(
        buildApiKeyAuthContext({
          workspace: { id: WORKSPACE_ID },
          apiKey: { id: 'api-key-id' },
        } as Parameters<typeof buildApiKeyAuthContext>[0]),
      ),
    ).toThrow('Blocklist entries can only be managed by an authenticated user');
  });
});
