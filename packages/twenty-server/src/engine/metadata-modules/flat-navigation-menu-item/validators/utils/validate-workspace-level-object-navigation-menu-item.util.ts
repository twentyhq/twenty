import { msg, t } from '@lingui/core/macro';
import { getObjectNavigationMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

// A workspace-level OBJECT item is the object's sidebar row, provisioned by the
// metadata side-effect engine (objectNavigationMenuItemOnCreate). Unlike the
// record page there is no display resolver for a duplicate: the sidebar renders
// every row, so a second row is a visible regression rather than a shadowed
// definition. Two guards keep the singleton: the derived identifier is reserved
// for the engine, and an object cannot end up with two rows.
export const validateWorkspaceLevelObjectNavigationMenuItem = ({
  flatNavigationMenuItem,
  optimisticFlatNavigationMenuItemMaps,
  optimisticFlatObjectMetadataMaps,
}: {
  flatNavigationMenuItem: UniversalFlatNavigationMenuItem;
  optimisticFlatNavigationMenuItemMaps: MetadataUniversalFlatEntityMaps<'navigationMenuItem'>;
  optimisticFlatObjectMetadataMaps: MetadataUniversalFlatEntityMaps<'objectMetadata'>;
}): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] => {
  const { targetObjectMetadataUniversalIdentifier } = flatNavigationMenuItem;

  if (
    flatNavigationMenuItem.type !== NavigationMenuItemType.OBJECT ||
    isDefined(flatNavigationMenuItem.userWorkspaceId) ||
    !isDefined(targetObjectMetadataUniversalIdentifier)
  ) {
    return [];
  }

  const errors: FlatEntityValidationError<NavigationMenuItemExceptionCode>[] =
    [];

  const flatObjectMetadata =
    optimisticFlatObjectMetadataMaps.byUniversalIdentifier[
      targetObjectMetadataUniversalIdentifier
    ];

  if (isDefined(flatObjectMetadata)) {
    const reservedUniversalIdentifier =
      getObjectNavigationMenuItemUniversalIdentifier({
        applicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      });

    if (
      flatNavigationMenuItem.universalIdentifier ===
        reservedUniversalIdentifier &&
      flatNavigationMenuItem.isSystemSideEffect !== true
    ) {
      errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`This universal identifier is reserved for the engine-owned object navigation menu item`,
        userFriendlyMessage: msg`This navigation menu item identifier is reserved`,
      });
    }
  }

  const objectAlreadyHasWorkspaceLevelItem = Object.values(
    optimisticFlatNavigationMenuItemMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .some(
      (existingFlatNavigationMenuItem) =>
        existingFlatNavigationMenuItem.type === NavigationMenuItemType.OBJECT &&
        !isDefined(existingFlatNavigationMenuItem.userWorkspaceId) &&
        existingFlatNavigationMenuItem.targetObjectMetadataUniversalIdentifier ===
          targetObjectMetadataUniversalIdentifier,
    );

  if (objectAlreadyHasWorkspaceLevelItem) {
    errors.push({
      code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      message: t`Object already has a workspace navigation menu item`,
      userFriendlyMessage: msg`This object already has a navigation menu item`,
    });
  }

  return errors;
};
