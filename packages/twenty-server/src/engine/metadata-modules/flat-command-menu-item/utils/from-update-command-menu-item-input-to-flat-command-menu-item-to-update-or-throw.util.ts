import { isDefined } from 'twenty-shared/utils';

import {
  CommandMenuItemException,
  CommandMenuItemExceptionCode,
} from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { type UpdateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/update-command-menu-item.input';
import { type CommandMenuItemOverrides } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_COMMAND_MENU_ITEM_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-command-menu-item/constants/flat-command-menu-item-editable-properties.constant';
import { type FlatCommandMenuItemMaps } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item-maps.type';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { fromCommandMenuItemOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-command-menu-item-overrides-to-universal-overrides.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/utils/sanitize-overridable-entity-input.util';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateCommandMenuItemInputToFlatCommandMenuItemToUpdateOrThrow =
  ({
    flatCommandMenuItemMaps,
    updateCommandMenuItemInput,
    flatObjectMetadataMaps,
    flatPageLayoutMaps,
    callerApplicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    flatCommandMenuItemMaps: FlatCommandMenuItemMaps;
    updateCommandMenuItemInput: UpdateCommandMenuItemInput;
    callerApplicationUniversalIdentifier: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  } & Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatPageLayoutMaps'
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

    const shouldOverride = isCallerOverridingEntity({
      callerApplicationUniversalIdentifier,
      entityApplicationUniversalIdentifier:
        existingFlatCommandMenuItem.applicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
      isSystemSideEffect: existingFlatCommandMenuItem.isSystemSideEffect,
    });

    const { overrides, updatedEditableProperties } =
      sanitizeOverridableEntityInput({
        metadataName: 'commandMenuItem',
        existingFlatEntity: existingFlatCommandMenuItem,
        updatedEditableProperties: updates,
        shouldOverride,
      });

    const mergedRecord = mergeUpdateInExistingRecord({
      existing: existingFlatCommandMenuItem,
      properties: [...FLAT_COMMAND_MENU_ITEM_EDITABLE_PROPERTIES],
      update: updatedEditableProperties,
    });

    const flatCommandMenuItemToUpdate: FlatCommandMenuItem = {
      ...mergedRecord,
      // sanitizeOverridableEntityInput returns a loosely-typed Record overrides
      overrides: overrides as FlatCommandMenuItem['overrides'],
      updatedAt: new Date().toISOString(),
    };

    if (updatedEditableProperties.availabilityObjectMetadataId !== undefined) {
      const { availabilityObjectMetadataUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'commandMenuItem',
          foreignKeyValues: {
            availabilityObjectMetadataId:
              mergedRecord.availabilityObjectMetadataId,
          },
          flatEntityMaps: { flatObjectMetadataMaps },
        });

      flatCommandMenuItemToUpdate.availabilityObjectMetadataUniversalIdentifier =
        availabilityObjectMetadataUniversalIdentifier;
    }

    if (updatedEditableProperties.pageLayoutId !== undefined) {
      const { pageLayoutUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'commandMenuItem',
          foreignKeyValues: {
            pageLayoutId: mergedRecord.pageLayoutId,
          },
          flatEntityMaps: { flatPageLayoutMaps },
        });

      flatCommandMenuItemToUpdate.pageLayoutUniversalIdentifier =
        pageLayoutUniversalIdentifier;
    }

    if (isDefined(overrides)) {
      flatCommandMenuItemToUpdate.universalOverrides =
        fromCommandMenuItemOverridesToUniversalOverrides({
          overrides: overrides as CommandMenuItemOverrides,
          objectMetadataUniversalIdentifierById:
            flatObjectMetadataMaps.universalIdentifierById,
          pageLayoutUniversalIdentifierById:
            flatPageLayoutMaps.universalIdentifierById,
        });
    } else {
      flatCommandMenuItemToUpdate.universalOverrides = null;
    }

    return flatCommandMenuItemToUpdate;
  };
