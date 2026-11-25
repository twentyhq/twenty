import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { isPrivatableEntityCreatorAssignedByBuilder } from 'src/engine/permissions/metadata-permissions/utils/is-privatable-entity-creator-assigned-by-builder.util';

export const keepPrivatableEntityCreatorOnUpdate = <
  TUpdate extends Record<string, unknown>,
>({
  metadataName,
  update,
  authContext,
}: {
  metadataName: AllMetadataName;
  update: TUpdate;
  authContext: WorkspaceAuthContext | undefined;
}): Partial<TUpdate> => {
  if (
    !isPrivatableEntityCreatorAssignedByBuilder({ metadataName, authContext })
  ) {
    return update;
  }

  const updateWithoutCreator: Partial<TUpdate> = { ...update };

  delete updateWithoutCreator.createdByUserWorkspaceId;

  return updateWithoutCreator;
};
