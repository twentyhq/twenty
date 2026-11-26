import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getUserWorkspaceIdFromAuthContext } from 'src/engine/core-modules/auth/utils/get-user-workspace-id-from-auth-context.util';
import { isPrivatableMetadataName } from 'src/engine/permissions/metadata-permissions/utils/is-privatable-metadata-name.util';

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
    !isPrivatableMetadataName(metadataName) ||
    !isDefined(authContext) ||
    isSystemAuthContext(authContext) ||
    universalFlatEntity.isSystemSideEffect
  ) {
    return universalFlatEntity;
  }

  return {
    ...universalFlatEntity,
    createdByUserWorkspaceId:
      getUserWorkspaceIdFromAuthContext(authContext) ?? null,
  };
};
