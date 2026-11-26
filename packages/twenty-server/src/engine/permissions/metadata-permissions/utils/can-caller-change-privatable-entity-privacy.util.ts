import { isDefined } from 'twenty-shared/utils';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PrivatableEntity } from 'src/engine/permissions/metadata-permissions/types/privatable-entity.type';

export const canCallerChangePrivatableEntityPrivacy = ({
  privatableEntity,
  authContext = workspaceAuthContextStorage.getStore(),
}: {
  privatableEntity: Pick<PrivatableEntity, 'createdByUserWorkspaceId'>;
  authContext?: WorkspaceAuthContext;
}): boolean => {
  if (!isDefined(authContext)) {
    return false;
  }

  if (isSystemAuthContext(authContext)) {
    return true;
  }

  return (
    isUserAuthContext(authContext) &&
    isDefined(privatableEntity.createdByUserWorkspaceId) &&
    privatableEntity.createdByUserWorkspaceId === authContext.userWorkspaceId
  );
};
