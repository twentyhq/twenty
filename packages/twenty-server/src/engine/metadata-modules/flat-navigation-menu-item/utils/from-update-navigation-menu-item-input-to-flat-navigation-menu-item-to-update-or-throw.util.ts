import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_NAVIGATION_MENU_ITEM_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-navigation-menu-item/constants/flat-navigation-menu-item-editable-properties.constant';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { applyNavigationMenuItemIsActiveOverrideOrThrow } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/apply-navigation-menu-item-is-active-override-or-throw.util';
import { type UpdateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';
import {
  NavigationMenuItemException,
  NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateNavigationMenuItemInputToFlatNavigationMenuItemToUpdateOrThrow =
  ({
    flatNavigationMenuItemMaps,
    flatPageLayoutMaps,
    updateNavigationMenuItemInput,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
    updateNavigationMenuItemInput: UpdateNavigationMenuItemInput & {
      id: string;
    };
    workspaceCustomApplicationUniversalIdentifier: string;
  } & Pick<
    AllFlatEntityMaps,
    'flatPageLayoutMaps'
  >): FlatNavigationMenuItem => {
    const existingFlatNavigationMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updateNavigationMenuItemInput.id,
      flatEntityMaps: flatNavigationMenuItemMaps,
    });

    if (!isDefined(existingFlatNavigationMenuItem)) {
      throw new NavigationMenuItemException(
        'Navigation menu item not found',
        NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
      );
    }

    const { id: _id, isActive, ...updates } = updateNavigationMenuItemInput;

    const mergedFlatNavigationMenuItem = mergeUpdateInExistingRecord({
      existing: existingFlatNavigationMenuItem,
      properties: [...FLAT_NAVIGATION_MENU_ITEM_EDITABLE_PROPERTIES],
      update: updates,
    });

    const flatNavigationMenuItemToUpdate = {
      ...(isDefined(isActive)
        ? applyNavigationMenuItemIsActiveOverrideOrThrow({
            flatNavigationMenuItem: mergedFlatNavigationMenuItem,
            isActive,
            workspaceCustomApplicationUniversalIdentifier,
          })
        : mergedFlatNavigationMenuItem),
      updatedAt: new Date().toISOString(),
    };

    if (updates.parentId !== undefined) {
      const { parentUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'navigationMenuItem',
          foreignKeyValues: {
            parentId: flatNavigationMenuItemToUpdate.parentId,
          },
          flatEntityMaps: { flatNavigationMenuItemMaps },
        });

      flatNavigationMenuItemToUpdate.parentUniversalIdentifier =
        parentUniversalIdentifier;
    }

    if (updates.pageLayoutId !== undefined) {
      const { pageLayoutUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'navigationMenuItem',
          foreignKeyValues: {
            pageLayoutId: flatNavigationMenuItemToUpdate.pageLayoutId,
          },
          flatEntityMaps: { flatPageLayoutMaps },
        });

      flatNavigationMenuItemToUpdate.pageLayoutUniversalIdentifier =
        pageLayoutUniversalIdentifier;
    }

    return flatNavigationMenuItemToUpdate;
  };
