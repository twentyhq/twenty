import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { isViewVisibleToCaller } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-caller.util';

const OVERRIDING_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-aaaa-4aaa-8aaa-000000000001';

const authContext = buildUserAuthContext({
  workspace: { id: 'workspace-1' } as NonNullable<RawAuthContext['workspace']>,
  userWorkspaceId: 'me',
  user: { id: 'user-1' } as NonNullable<RawAuthContext['user']>,
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' } as NonNullable<
    RawAuthContext['workspaceMember']
  >,
  userSessionVariant: 'standard',
});

describe('isViewVisibleToCaller', () => {
  it('hides a shared view overridden to private from a non-owner', () => {
    expect(
      isViewVisibleToCaller({
        view: {
          isPrivate: false,
          createdByUserWorkspaceId: 'someone-else',
          overrides: {
            [OVERRIDING_APPLICATION_UNIVERSAL_IDENTIFIER]: { isPrivate: true },
          },
        },
        authContext,
      }),
    ).toBe(false);
  });

  it('shows a private view overridden to shared to anyone', () => {
    expect(
      isViewVisibleToCaller({
        view: {
          isPrivate: true,
          createdByUserWorkspaceId: 'someone-else',
          overrides: {
            [OVERRIDING_APPLICATION_UNIVERSAL_IDENTIFIER]: { isPrivate: false },
          },
        },
        authContext,
      }),
    ).toBe(true);
  });
});
