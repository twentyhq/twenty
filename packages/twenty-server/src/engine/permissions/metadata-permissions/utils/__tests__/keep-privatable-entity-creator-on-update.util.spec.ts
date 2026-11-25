import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { keepPrivatableEntityCreatorOnUpdate } from 'src/engine/permissions/metadata-permissions/utils/keep-privatable-entity-creator-on-update.util';

const workspace = { id: 'workspace-1' } as NonNullable<
  RawAuthContext['workspace']
>;

const memberAuthContext = buildUserAuthContext({
  workspace,
  userWorkspaceId: 'caller-user-workspace',
  user: { id: 'user-1' } as NonNullable<RawAuthContext['user']>,
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' } as NonNullable<
    RawAuthContext['workspaceMember']
  >,
  userSessionVariant: 'standard',
});

const updateWithCreator = {
  isPrivate: true,
  createdByUserWorkspaceId: 'caller-user-workspace',
};

describe('keepPrivatableEntityCreatorOnUpdate', () => {
  it('drops a creator change from members and from callers with no context', () => {
    for (const authContext of [memberAuthContext, undefined]) {
      expect(
        keepPrivatableEntityCreatorOnUpdate({
          metadataName: 'workflow',
          update: updateWithCreator,
          authContext,
        }),
      ).toEqual({ isPrivate: true });
    }
  });

  it('lets the system move the creator', () => {
    expect(
      keepPrivatableEntityCreatorOnUpdate({
        metadataName: 'view',
        update: updateWithCreator,
        authContext: buildSystemAuthContext({ workspace }),
      }),
    ).toEqual(updateWithCreator);
  });

  it('leaves metadata that cannot be private untouched', () => {
    expect(
      keepPrivatableEntityCreatorOnUpdate({
        metadataName: 'objectMetadata',
        update: updateWithCreator,
        authContext: memberAuthContext,
      }),
    ).toEqual(updateWithCreator);
  });
});
