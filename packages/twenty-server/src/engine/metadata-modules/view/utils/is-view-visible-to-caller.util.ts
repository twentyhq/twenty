import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type OverridableFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { getEffectiveViewIsPrivate } from 'src/engine/metadata-modules/view/utils/get-effective-view-is-private.util';
import { type OwnableEntity } from 'src/engine/permissions/metadata-permissions/types/ownable-entity.type';
import { isOwnableEntityVisibleToCaller } from 'src/engine/permissions/metadata-permissions/utils/is-ownable-entity-visible-to-caller.util';

export const isViewVisibleToCaller = ({
  view,
  authContext,
}: {
  view: OverridableFlatEntity &
    Pick<OwnableEntity, 'isPrivate'> &
    Partial<Pick<OwnableEntity, 'createdByUserWorkspaceId'>>;
  authContext?: WorkspaceAuthContext;
}): boolean =>
  isOwnableEntityVisibleToCaller({
    ownableEntity: {
      isPrivate: getEffectiveViewIsPrivate(view),
      createdByUserWorkspaceId: view.createdByUserWorkspaceId,
    },
    authContext,
  });
