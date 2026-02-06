import { isDefined } from 'twenty-shared/utils';

import {
  CommandMenuItemException,
  CommandMenuItemExceptionCode,
} from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { type UpdateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/update-command-menu-item.input';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_COMMAND_MENU_ITEM_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-command-menu-item/constants/flat-command-menu-item-editable-properties.constant';
import { type FlatCommandMenuItemMaps } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item-maps.type';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateCommandMenuItemInputToFlatCommandMenuItemToUpdateOrThrow =
  ({
    flatCommandMenuItemMaps,
    updateCommandMenuItemInput,
    flatObjectMetadataMaps,
  }: {
    flatCommandMenuItemMaps: FlatCommandMenuItemMaps;
    updateCommandMenuItemInput: UpdateCommandMenuItemInput;
  } & Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps'
  >): FlatCommandMenuItem => {
    const existingFlatCommandMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updateCommandMenuItemInput.id,
      flatEntityMaps: flatCommandMenuItemMaps,
    });

    if (!isDefined(existingFlatCommandMenuItem)) {
      throw new CommandMenuItemException(
        'Command menu item not found',
        CommandMenuItemExceptionCode.COMMAND_MENU_ITEM_NOT_FOUND,
      );
    }

    const { id: _id, ...updates } = updateCommandMenuItemInput;

    const flatCommandMenuItemToUpdate = {
      ...mergeUpdateInExistingRecord({
        existing: existingFlatCommandMenuItem,
        properties: [...FLAT_COMMAND_MENU_ITEM_EDITABLE_PROPERTIES],
        update: updates,
      }),
      updatedAt: new Date().toISOString(),
    };

    if (updates.availabilityObjectMetadataId !== undefined) {
      const { availabilityObjectMetadataUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'commandMenuItem',
          foreignKeyValues: {
            availabilityObjectMetadataId:
              flatCommandMenuItemToUpdate.availabilityObjectMetadataId,
          },
          flatEntityMaps: { flatObjectMetadataMaps },
        });

      flatCommandMenuItemToUpdate.availabilityObjectMetadataUniversalIdentifier =
        availabilityObjectMetadataUniversalIdentifier;
    }

    return flatCommandMenuItemToUpdate;
  };
