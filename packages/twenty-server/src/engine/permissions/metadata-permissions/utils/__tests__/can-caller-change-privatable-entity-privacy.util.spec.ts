import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { buildPendingActivationUserAuthContext } from 'src/engine/core-modules/auth/utils/build-pending-activation-user-auth-context.util';
import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { canCallerChangePrivatableEntityPrivacy } from 'src/engine/permissions/metadata-permissions/utils/can-caller-change-privatable-entity-privacy.util';

const CREATOR_USER_WORKSPACE_ID = 'creator-user-workspace';

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

const createdEntity = { createdByUserWorkspaceId: CREATOR_USER_WORKSPACE_ID };
const ownerlessEntity = { createdByUserWorkspaceId: null };

describe('canCallerChangePrivatableEntityPrivacy', () => {
  it('lets the creator change the privacy, and no other member', () => {
    expect(
      canCallerChangePrivatableEntityPrivacy({
        privatableEntity: createdEntity,
        authContext: buildMemberAuthContext(CREATOR_USER_WORKSPACE_ID),
      }),
    ).toBe(true);
    expect(
      canCallerChangePrivatableEntityPrivacy({
        privatableEntity: createdEntity,
        authContext: buildMemberAuthContext('someone-else'),
      }),
    ).toBe(false);
  });

  it('refuses members on an entity with no creator', () => {
    expect(
      canCallerChangePrivatableEntityPrivacy({
        privatableEntity: ownerlessEntity,
        authContext: buildMemberAuthContext('someone-else'),
      }),
    ).toBe(false);
  });

  it('refuses callers that are not workspace members, even without a creator', () => {
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
        userWorkspaceId: CREATOR_USER_WORKSPACE_ID,
        user,
      }),
    ];

    for (const authContext of nonMemberAuthContexts) {
      for (const privatableEntity of [createdEntity, ownerlessEntity]) {
        expect(
          canCallerChangePrivatableEntityPrivacy({
            privatableEntity,
            authContext,
          }),
        ).toBe(false);
      }
    }
  });

  it('lets the system change the privacy', () => {
    expect(
      canCallerChangePrivatableEntityPrivacy({
        privatableEntity: createdEntity,
        authContext: buildSystemAuthContext({ workspace }),
      }),
    ).toBe(true);
  });

  it('reads the caller from the request auth context by default', () => {
    expect(
      workspaceAuthContextStorage.run(
        buildMemberAuthContext(CREATOR_USER_WORKSPACE_ID),
        () =>
          canCallerChangePrivatableEntityPrivacy({
            privatableEntity: createdEntity,
          }),
      ),
    ).toBe(true);
    expect(
      canCallerChangePrivatableEntityPrivacy({
        privatableEntity: ownerlessEntity,
      }),
    ).toBe(false);
  });
});
