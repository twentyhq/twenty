import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PrivatableEntity } from 'src/engine/permissions/metadata-permissions/types/privatable-entity.type';
import { getPrivatableEntityCallerScope } from 'src/engine/permissions/metadata-permissions/utils/get-privatable-entity-caller-scope.util';

export const isPrivatableEntityVisibleToCaller = ({
  privatableEntity,
  authContext = workspaceAuthContextStorage.getStore(),
}: {
  privatableEntity: Pick<PrivatableEntity, 'isPrivate'> &
    Partial<Pick<PrivatableEntity, 'createdByUserWorkspaceId'>>;
  authContext?: WorkspaceAuthContext;
}): boolean => {
  if (privatableEntity.isPrivate === false) {
    return true;
  }

  const callerScope = getPrivatableEntityCallerScope(authContext);

  switch (callerScope.type) {
    case 'all':
      return true;
    case 'shared':
      return false;
    case 'sharedAndOwned':
      return (
        privatableEntity.createdByUserWorkspaceId ===
        callerScope.userWorkspaceId
      );
  }
};
