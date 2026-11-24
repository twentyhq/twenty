import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { buildPendingActivationUserAuthContext } from 'src/engine/core-modules/auth/utils/build-pending-activation-user-auth-context.util';
import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { isPrivatableEntityVisibleToCaller } from 'src/engine/permissions/metadata-permissions/utils/is-privatable-entity-visible-to-caller.util';

const OWNER_USER_WORKSPACE_ID = 'owner-user-workspace';

const workspace = { id: 'workspace-1' } as NonNullable<
  RawAuthContext['workspace']
>;
const user = { id: 'user-1' } as NonNullable<RawAuthContext['user']>;

const buildMemberAuthContext = (userWorkspaceId: string) =>
  buildUserAuthContext({
    workspace,
    userWorkspaceId,
    user,
    workspaceMemberId: 'workspace-member-1',
    workspaceMember: { id: 'workspace-member-1' } as NonNullable<
      RawAuthContext['workspaceMember']
    >,
    userSessionVariant: 'standard',
  });

const privateEntity = {
  isPrivate: true,
  createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
};

const sharedEntity = {
  isPrivate: false,
  createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
};

describe('isPrivatableEntityVisibleToCaller', () => {
  it('shows a shared entity to every caller, including none', () => {
    expect(
      isPrivatableEntityVisibleToCaller({
        privatableEntity: sharedEntity,
        authContext: buildMemberAuthContext('someone-else'),
      }),
    ).toBe(true);
    expect(
      isPrivatableEntityVisibleToCaller({ privatableEntity: sharedEntity }),
    ).toBe(true);
  });

  it('shows a private entity to its creator only', () => {
    expect(
      isPrivatableEntityVisibleToCaller({
        privatableEntity: privateEntity,
        authContext: buildMemberAuthContext(OWNER_USER_WORKSPACE_ID),
      }),
    ).toBe(true);
    expect(
      isPrivatableEntityVisibleToCaller({
        privatableEntity: privateEntity,
        authContext: buildMemberAuthContext('someone-else'),
      }),
    ).toBe(false);
  });

  it('hides an ownerless private entity from every member', () => {
    expect(
      isPrivatableEntityVisibleToCaller({
        privatableEntity: { isPrivate: true, createdByUserWorkspaceId: null },
        authContext: buildMemberAuthContext(OWNER_USER_WORKSPACE_ID),
      }),
    ).toBe(false);
  });

  it('hides a private entity from callers that are not workspace members', () => {
    const nonMemberAuthContexts = [
      buildApiKeyAuthContext({
        workspace,
        apiKey: { id: 'api-key-1' } as NonNullable<RawAuthContext['apiKey']>,
      }),
      buildApplicationAuthContext({
        workspace,
        application: { id: 'application-1' } as NonNullable<
          RawAuthContext['application']
        >,
      }),
      buildPendingActivationUserAuthContext({
        workspace,
        userWorkspaceId: OWNER_USER_WORKSPACE_ID,
        user,
      }),
    ];

    for (const authContext of nonMemberAuthContexts) {
      expect(
        isPrivatableEntityVisibleToCaller({
          privatableEntity: privateEntity,
          authContext,
        }),
      ).toBe(false);
    }
  });

  it('shows a private entity to the system', () => {
    expect(
      isPrivatableEntityVisibleToCaller({
        privatableEntity: privateEntity,
        authContext: buildSystemAuthContext({ workspace }),
      }),
    ).toBe(true);
  });

  it('reads the caller from the request auth context by default', () => {
    expect(
      workspaceAuthContextStorage.run(
        buildMemberAuthContext(OWNER_USER_WORKSPACE_ID),
        () =>
          isPrivatableEntityVisibleToCaller({
            privatableEntity: privateEntity,
          }),
      ),
    ).toBe(true);
    expect(
      isPrivatableEntityVisibleToCaller({ privatableEntity: privateEntity }),
    ).toBe(false);
  });
});
