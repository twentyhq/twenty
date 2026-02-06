import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_NAVIGATION_MENU_ITEM_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-navigation-menu-item/constants/flat-navigation-menu-item-editable-properties.constant';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type UpdateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';
import {
  NavigationMenuItemException,
  NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateNavigationMenuItemInputToFlatNavigationMenuItemToUpdateOrThrow =
  ({
    flatNavigationMenuItemMaps,
    updateNavigationMenuItemInput,
  }: {
    flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
    updateNavigationMenuItemInput: UpdateNavigationMenuItemInput & {
      id: string;
    };
  }): FlatNavigationMenuItem => {
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

    const { id: _id, ...updates } = updateNavigationMenuItemInput;

    const flatNavigationMenuItemToUpdate = {
      ...mergeUpdateInExistingRecord({
        existing: existingFlatNavigationMenuItem,
        properties: [...FLAT_NAVIGATION_MENU_ITEM_EDITABLE_PROPERTIES],
        update: updates,
      }),
      updatedAt: new Date().toISOString(),
    };

    if (updates.folderId !== undefined) {
      const { folderUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'navigationMenuItem',
          foreignKeyValues: {
            folderId: flatNavigationMenuItemToUpdate.folderId,
          },
          flatEntityMaps: { flatNavigationMenuItemMaps },
        });

      flatNavigationMenuItemToUpdate.folderUniversalIdentifier =
        folderUniversalIdentifier;
    }

    return flatNavigationMenuItemToUpdate;
  };
