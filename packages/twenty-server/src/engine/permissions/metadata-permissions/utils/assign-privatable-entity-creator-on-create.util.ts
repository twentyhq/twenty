import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getUserWorkspaceIdFromAuthContext } from 'src/engine/core-modules/auth/utils/get-user-workspace-id-from-auth-context.util';
import { isPrivatableEntityCreatorAssignedByBuilder } from 'src/engine/permissions/metadata-permissions/utils/is-privatable-entity-creator-assigned-by-builder.util';

export const assignPrivatableEntityCreatorOnCreate = <
  TUniversalFlatEntity extends Record<string, unknown>,
>({
  metadataName,
  universalFlatEntity,
  authContext,
}: {
  metadataName: AllMetadataName;
  universalFlatEntity: TUniversalFlatEntity;
  authContext: WorkspaceAuthContext | undefined;
}): TUniversalFlatEntity => {
  if (
    !isPrivatableEntityCreatorAssignedByBuilder({
      metadataName,
      authContext,
    }) ||
    !isDefined(authContext) ||
    universalFlatEntity.isSystemSideEffect === true
  ) {
    return universalFlatEntity;
  }

  return {
    ...universalFlatEntity,
    createdByUserWorkspaceId:
      getUserWorkspaceIdFromAuthContext(authContext) ?? null,
  };
};
