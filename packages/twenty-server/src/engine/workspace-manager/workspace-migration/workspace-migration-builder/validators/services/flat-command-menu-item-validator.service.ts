import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuItemExceptionCode } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatCommandMenuItemValidatorService {
  public validateFlatCommandMenuItemCreation({
    flatEntityToValidate: flatCommandMenuItem,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.commandMenuItem
  >): FailedFlatEntityValidation<'commandMenuItem', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
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

    const hasWorkflowVersionId = isDefined(
      flatCommandMenuItem.workflowVersionId,
    );
    const hasFrontComponentUniversalIdentifier = isDefined(
      flatCommandMenuItem.frontComponentUniversalIdentifier,
    );

    if (hasWorkflowVersionId === hasFrontComponentUniversalIdentifier) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.WORKFLOW_OR_FRONT_COMPONENT_REQUIRED,
        message: t`Exactly one of workflowVersionId or frontComponentUniversalIdentifier is required`,
        userFriendlyMessage: msg`Exactly one of workflow version or front component is required`,
      });
    }

    return validationResult;
  }

  public validateFlatCommandMenuItemDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatCommandMenuItemMaps: optimisticFlatCommandMenuItemMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.commandMenuItem
  >): FailedFlatEntityValidation<'commandMenuItem', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'commandMenuItem',
      type: 'delete',
    });

    const existingCommandMenuItem = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
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
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatCommandMenuItemMaps: optimisticFlatCommandMenuItemMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.commandMenuItem
  >): FailedFlatEntityValidation<'commandMenuItem', 'update'> {
    const fromFlatCommandMenuItem = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatCommandMenuItemMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
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

    const labelUpdate = flatEntityUpdate.label;

    if (isDefined(labelUpdate) && !isNonEmptyString(labelUpdate)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`Label is required`,
        userFriendlyMessage: msg`Label is required`,
      });
    }

    return validationResult;
  }
}
