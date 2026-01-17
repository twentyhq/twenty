import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuItemExceptionCode } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration/utils/find-flat-entity-property-update.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';

@Injectable()
export class FlatCommandMenuItemValidatorService {
  public validateFlatCommandMenuItemCreation({
    flatEntityToValidate: flatCommandMenuItem,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.commandMenuItem
  >): FailedFlatEntityValidation<'commandMenuItem', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatCommandMenuItem.id,
        universalIdentifier: flatCommandMenuItem.universalIdentifier,
      },
      metadataName: 'commandMenuItem',
      type: 'create',
    });

    if (!isNonEmptyString(flatCommandMenuItem.label)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`Label is required`,
        userFriendlyMessage: msg`Label is required`,
      });
    }

    return validationResult;
  }

  public validateFlatCommandMenuItemDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatCommandMenuItemMaps: optimisticFlatCommandMenuItemMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.commandMenuItem
  >): FailedFlatEntityValidation<'commandMenuItem', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'commandMenuItem',
      type: 'delete',
    });

    const existingCommandMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatEntityToValidate.id,
      flatEntityMaps: optimisticFlatCommandMenuItemMaps,
    });

    if (!isDefined(existingCommandMenuItem)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.COMMAND_MENU_ITEM_NOT_FOUND,
        message: t`Command menu item not found`,
        userFriendlyMessage: msg`Command menu item not found`,
      });
    }

    return validationResult;
  }

  public validateFlatCommandMenuItemUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatCommandMenuItemMaps: optimisticFlatCommandMenuItemMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.commandMenuItem
  >): FailedFlatEntityValidation<'commandMenuItem', 'update'> {
    const fromFlatCommandMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: optimisticFlatCommandMenuItemMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: fromFlatCommandMenuItem?.universalIdentifier,
      },
      metadataName: 'commandMenuItem',
      type: 'update',
    });

    if (!isDefined(fromFlatCommandMenuItem)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.COMMAND_MENU_ITEM_NOT_FOUND,
        message: t`Command menu item not found`,
        userFriendlyMessage: msg`Command menu item not found`,
      });

      return validationResult;
    }

    const labelUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates,
      property: 'label',
    });

    if (isDefined(labelUpdate) && !isNonEmptyString(labelUpdate.to)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`Label is required`,
        userFriendlyMessage: msg`Label is required`,
      });
    }

    return validationResult;
  }
}
