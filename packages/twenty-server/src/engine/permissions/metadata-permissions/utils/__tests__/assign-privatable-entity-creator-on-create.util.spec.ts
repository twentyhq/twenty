import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { assignPrivatableEntityCreatorOnCreate } from 'src/engine/permissions/metadata-permissions/utils/assign-privatable-entity-creator-on-create.util';

const CALLER_USER_WORKSPACE_ID = 'caller-user-workspace';
const OTHER_USER_WORKSPACE_ID = 'other-user-workspace';

const workspace = { id: 'workspace-1' } as NonNullable<
  RawAuthContext['workspace']
>;

const memberAuthContext = buildUserAuthContext({
  workspace,
  userWorkspaceId: CALLER_USER_WORKSPACE_ID,
  user: { id: 'user-1' } as NonNullable<RawAuthContext['user']>,
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' } as NonNullable<
    RawAuthContext['workspaceMember']
  >,
  userSessionVariant: 'standard',
});

const viewFromInput = {
  name: 'My view',
  isPrivate: true,
  createdByUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
};

describe('assignPrivatableEntityCreatorOnCreate', () => {
  it('makes the calling member the creator, whatever the input says', () => {
    expect(
      assignPrivatableEntityCreatorOnCreate({
        metadataName: 'view',
        universalFlatEntity: viewFromInput,
        authContext: memberAuthContext,
      }),
    ).toEqual({
      ...viewFromInput,
      createdByUserWorkspaceId: CALLER_USER_WORKSPACE_ID,
    });
  });

  it('leaves no creator when the caller is not a member', () => {
    expect(
      assignPrivatableEntityCreatorOnCreate({
        metadataName: 'workflow',
        universalFlatEntity: viewFromInput,
        authContext: buildApiKeyAuthContext({
          workspace,
          apiKey: { id: 'api-key-1' } as NonNullable<RawAuthContext['apiKey']>,
        }),
      }).createdByUserWorkspaceId,
    ).toBeNull();
  });

  it('keeps the given creator for the system, side effects and other metadata', () => {
    expect(
      assignPrivatableEntityCreatorOnCreate({
        metadataName: 'agent',
        universalFlatEntity: viewFromInput,
        authContext: buildSystemAuthContext({ workspace }),
      }),
    ).toBe(viewFromInput);
    expect(
      assignPrivatableEntityCreatorOnCreate({
        metadataName: 'view',
        universalFlatEntity: { ...viewFromInput, isSystemSideEffect: true },
        authContext: memberAuthContext,
      }).createdByUserWorkspaceId,
    ).toBe(OTHER_USER_WORKSPACE_ID);
    expect(
      assignPrivatableEntityCreatorOnCreate({
        metadataName: 'objectMetadata',
        universalFlatEntity: viewFromInput,
        authContext: memberAuthContext,
      }),
    ).toBe(viewFromInput);
  });
});
