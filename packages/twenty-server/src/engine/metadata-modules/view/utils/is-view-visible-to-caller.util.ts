import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type OverridableFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { getEffectiveViewIsPrivate } from 'src/engine/metadata-modules/view/utils/get-effective-view-is-private.util';
import { type PrivatableEntity } from 'src/engine/permissions/metadata-permissions/types/privatable-entity.type';
import { isPrivatableEntityVisibleToCaller } from 'src/engine/permissions/metadata-permissions/utils/is-privatable-entity-visible-to-caller.util';

export const isViewVisibleToCaller = ({
  view,
  authContext,
}: {
  view: OverridableFlatEntity &
    Pick<PrivatableEntity, 'isPrivate'> &
    Partial<Pick<PrivatableEntity, 'createdByUserWorkspaceId'>>;
  authContext?: WorkspaceAuthContext;
}): boolean =>
  isPrivatableEntityVisibleToCaller({
    privatableEntity: {
      isPrivate: getEffectiveViewIsPrivate(view),
      createdByUserWorkspaceId: view.createdByUserWorkspaceId,
    },
    authContext,
  });
