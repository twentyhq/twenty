import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { dispatchIsActiveUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-is-active-update-to-authored-override.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';

export const computeNavigationMenuItemRemovalOperations = ({
  rootNavigationMenuItems,
  childrenByUserWorkspaceIdAndParentId,
  workspaceCustomApplicationUniversalIdentifier,
  now,
}: {
  rootNavigationMenuItems: FlatNavigationMenuItem[];
  childrenByUserWorkspaceIdAndParentId: Partial<
    Record<string, Partial<Record<string, FlatNavigationMenuItem[]>>>
  >;
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
}): {
  flatEntityToDelete: FlatNavigationMenuItem[];
  flatEntityToUpdate: FlatNavigationMenuItem[];
} => {
  const deletedById = new Map<string, FlatNavigationMenuItem>();
  const updatedById = new Map<string, FlatNavigationMenuItem>();

  const isOwnedByAnotherApplication = (
    navigationMenuItem: FlatNavigationMenuItem,
  ) =>
    isCallerOverridingEntity({
      callerApplicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
      entityApplicationUniversalIdentifier:
        navigationMenuItem.applicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
      isSystemSideEffect: false,
    });

  const deactivate = (
    navigationMenuItem: FlatNavigationMenuItem,
    parent: Pick<
      FlatNavigationMenuItem,
      'parentId' | 'parentUniversalIdentifier'
    >,
  ) => {
    const latestNavigationMenuItem =
      updatedById.get(navigationMenuItem.id) ?? navigationMenuItem;

    updatedById.set(navigationMenuItem.id, {
      ...dispatchIsActiveUpdateToAuthoredOverride({
        metadataName: 'navigationMenuItem',
        flatEntity: latestNavigationMenuItem,
        isActive: false,
        authorUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
        workspaceCustomApplicationUniversalIdentifier,
      }),
      parentId: parent.parentId,
      parentUniversalIdentifier: parent.parentUniversalIdentifier,
      updatedAt: now,
    });
  };

  const deleteWithOwnedDescendants = (
    navigationMenuItem: FlatNavigationMenuItem,
    survivingParent: Pick<
      FlatNavigationMenuItem,
      'parentId' | 'parentUniversalIdentifier'
    >,
  ) => {
    const children =
      childrenByUserWorkspaceIdAndParentId[
        navigationMenuItem.userWorkspaceId ?? 'null'
      ]?.[navigationMenuItem.id] ?? [];

    for (const child of children) {
      if (isOwnedByAnotherApplication(child)) {
        deactivate(child, survivingParent);
      } else {
        deleteWithOwnedDescendants(child, survivingParent);
      }
    }

    deletedById.set(navigationMenuItem.id, navigationMenuItem);
  };

  for (const rootNavigationMenuItem of rootNavigationMenuItems) {
    if (deletedById.has(rootNavigationMenuItem.id)) {
      continue;
    }

    if (isOwnedByAnotherApplication(rootNavigationMenuItem)) {
      deactivate(
        rootNavigationMenuItem,
        updatedById.get(rootNavigationMenuItem.id) ?? rootNavigationMenuItem,
      );
      continue;
    }

    deleteWithOwnedDescendants(rootNavigationMenuItem, rootNavigationMenuItem);
  }

  return {
    flatEntityToDelete: [...deletedById.values()],
    flatEntityToUpdate: [...updatedById.values()],
  };
};
