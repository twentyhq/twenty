import { isDefined } from 'twenty-shared/utils';

import { fromConditionalDisplayToUniversalConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/from-conditional-display-to-universal-conditional-display.util';
import { normalizeConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/normalize-conditional-display.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
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
    flatPageLayoutMaps,
    flatFieldMetadataMaps,
    flatRoleMaps,
    updateNavigationMenuItemInput,
  }: {
    flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
    updateNavigationMenuItemInput: UpdateNavigationMenuItemInput & {
      id: string;
    };
  } & Pick<
    AllFlatEntityMaps,
    'flatPageLayoutMaps' | 'flatFieldMetadataMaps' | 'flatRoleMaps'
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

    const { id: _id, ...updates } = updateNavigationMenuItemInput;

    if (updates.conditionalDisplay !== undefined) {
      updates.conditionalDisplay = normalizeConditionalDisplay(
        updates.conditionalDisplay,
      );
    }

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

    if (updates.conditionalDisplay !== undefined) {
      flatNavigationMenuItemToUpdate.universalConditionalDisplay =
        fromConditionalDisplayToUniversalConditionalDisplay({
          conditionalDisplay: flatNavigationMenuItemToUpdate.conditionalDisplay,
          fieldMetadataUniversalIdentifierById:
            flatFieldMetadataMaps.universalIdentifierById,
          roleUniversalIdentifierById: flatRoleMaps.universalIdentifierById,
        });
    }

    return flatNavigationMenuItemToUpdate;
  };
