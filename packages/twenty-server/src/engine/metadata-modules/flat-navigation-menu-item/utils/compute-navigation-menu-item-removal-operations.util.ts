import { isDefined } from 'twenty-shared/utils';

import { splitEntitiesByRemovalStrategy } from 'src/engine/metadata-modules/flat-entity/utils/split-entities-by-removal-strategy.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

type NavigationMenuItemParent = Pick<
  FlatNavigationMenuItem,
  'parentId' | 'parentUniversalIdentifier'
>;

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

  const splitByRemovalStrategy = (
    navigationMenuItems: FlatNavigationMenuItem[],
  ) =>
    splitEntitiesByRemovalStrategy({
      metadataName: 'navigationMenuItem',
      entitiesToRemove: navigationMenuItems.map(
        (navigationMenuItem) =>
          updatedById.get(navigationMenuItem.id) ?? navigationMenuItem,
      ),
      workspaceCustomApplicationUniversalIdentifier,
      now,
    });

  const deleteWithOwnedDescendants = ({
    navigationMenuItem,
    survivingParent,
  }: {
    navigationMenuItem: FlatNavigationMenuItem;
    survivingParent: NavigationMenuItemParent;
  }) => {
    const children =
      childrenByUserWorkspaceIdAndParentId[
        navigationMenuItem.userWorkspaceId ?? 'null'
      ]?.[navigationMenuItem.id] ?? [];
    const { toHardDelete, toDeactivate } = splitByRemovalStrategy(children);

    for (const deactivatedChild of toDeactivate) {
      updatedById.set(deactivatedChild.id, {
        ...deactivatedChild,
        parentId: survivingParent.parentId,
        parentUniversalIdentifier: survivingParent.parentUniversalIdentifier,
      });
    }

    for (const ownedChild of toHardDelete) {
      deleteWithOwnedDescendants({
        navigationMenuItem: ownedChild,
        survivingParent,
      });
    }

    deletedById.set(navigationMenuItem.id, navigationMenuItem);
  };

  const parentIdByNavigationMenuItemId = new Map<string, string>();

  for (const childrenByParentId of Object.values(
    childrenByUserWorkspaceIdAndParentId,
  )) {
    for (const [parentId, children] of Object.entries(
      childrenByParentId ?? {},
    )) {
      for (const child of children ?? []) {
        parentIdByNavigationMenuItemId.set(child.id, parentId);
      }
    }
  }

  const rootIds = new Set(rootNavigationMenuItems.map(({ id }) => id));

  const hasAncestorInRoots = (navigationMenuItemId: string) => {
    const visitedIds = new Set<string>();
    let parentId = parentIdByNavigationMenuItemId.get(navigationMenuItemId);

    while (isDefined(parentId) && !visitedIds.has(parentId)) {
      if (rootIds.has(parentId)) {
        return true;
      }

      visitedIds.add(parentId);
      parentId = parentIdByNavigationMenuItemId.get(parentId);
    }

    return false;
  };

  const { toHardDelete, toDeactivate } = splitByRemovalStrategy(
    rootNavigationMenuItems.filter(({ id }) => !hasAncestorInRoots(id)),
  );

  for (const deactivatedRoot of toDeactivate) {
    updatedById.set(deactivatedRoot.id, deactivatedRoot);
  }

  for (const ownedRoot of toHardDelete) {
    deleteWithOwnedDescendants({
      navigationMenuItem: ownedRoot,
      survivingParent: ownedRoot,
    });
  }

  return {
    flatEntityToDelete: [...deletedById.values()],
    flatEntityToUpdate: [...updatedById.values()],
  };
};
