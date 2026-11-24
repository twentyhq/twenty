import { isDefined } from 'twenty-shared/utils';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type OwnableEntity } from 'src/engine/permissions/metadata-permissions/types/ownable-entity.type';

export const isOwnableEntityVisibleToCaller = ({
  ownableEntity,
  authContext = workspaceAuthContextStorage.getStore(),
}: {
  ownableEntity: Pick<OwnableEntity, 'isPrivate'> &
    Partial<Pick<OwnableEntity, 'createdByUserWorkspaceId'>>;
  authContext?: WorkspaceAuthContext;
}): boolean => {
  if (ownableEntity.isPrivate === false) {
    return true;
  }

  if (!isDefined(authContext)) {
    return false;
  }

  if (isSystemAuthContext(authContext)) {
    return true;
  }

  return (
    isUserAuthContext(authContext) &&
    ownableEntity.createdByUserWorkspaceId === authContext.userWorkspaceId
  );
};
