import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { getCallerUserWorkspaceId } from 'src/engine/permissions/metadata-permissions/utils/get-caller-user-workspace-id.util';

const workspace = { id: 'workspace-1' } as NonNullable<
  RawAuthContext['workspace']
>;

const memberAuthContext = buildUserAuthContext({
  workspace,
  userWorkspaceId: 'member-user-workspace',
  user: { id: 'user-1' } as NonNullable<RawAuthContext['user']>,
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' } as NonNullable<
    RawAuthContext['workspaceMember']
  >,
  userSessionVariant: 'standard',
});

describe('getCallerUserWorkspaceId', () => {
  it('returns the member of a user auth context', () => {
    expect(getCallerUserWorkspaceId(memberAuthContext)).toBe(
      'member-user-workspace',
    );
  });

  it('returns nothing for a caller that is not a member', () => {
    expect(
      getCallerUserWorkspaceId(buildSystemAuthContext({ workspace })),
    ).toBe(undefined);
    expect(getCallerUserWorkspaceId()).toBe(undefined);
  });

  it('reads the caller from the request auth context by default', () => {
    workspaceAuthContextStorage.run(memberAuthContext, () => {
      expect(getCallerUserWorkspaceId()).toBe('member-user-workspace');
    });
  });
});
