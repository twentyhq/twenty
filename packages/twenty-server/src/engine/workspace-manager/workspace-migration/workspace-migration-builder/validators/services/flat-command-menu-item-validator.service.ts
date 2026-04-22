import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuItemExceptionCode } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { type CommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item-payload.union';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
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

    if (!isDefined(flatCommandMenuItem.engineComponentKey)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`engineComponentKey is required`,
        userFriendlyMessage: msg`Engine component key is required`,
      });
    }

    this.validateEngineComponentKeyCoherence({
      engineComponentKey: flatCommandMenuItem.engineComponentKey,
      workflowVersionId: flatCommandMenuItem.workflowVersionId,
      frontComponentUniversalIdentifier:
        flatCommandMenuItem.frontComponentUniversalIdentifier,
      payload: flatCommandMenuItem.payload,
      validationResult,
    });

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

    const engineComponentKey =
      flatEntityUpdate.engineComponentKey ??
      fromFlatCommandMenuItem.engineComponentKey;

    const payload =
      flatEntityUpdate.payload !== undefined
        ? flatEntityUpdate.payload
        : fromFlatCommandMenuItem.payload;

    this.validateEngineComponentKeyCoherence({
      engineComponentKey,
      workflowVersionId: fromFlatCommandMenuItem.workflowVersionId,
      frontComponentUniversalIdentifier:
        fromFlatCommandMenuItem.frontComponentUniversalIdentifier,
      payload,
      validationResult,
    });

    return validationResult;
  }

  private validateEngineComponentKeyCoherence({
    engineComponentKey,
    workflowVersionId,
    frontComponentUniversalIdentifier,
    payload,
    validationResult,
  }: {
    engineComponentKey: EngineComponentKey | null;
    workflowVersionId: string | null;
    frontComponentUniversalIdentifier: string | null;
    payload: CommandMenuItemPayload | null;
    validationResult: FailedFlatEntityValidation<
      'commandMenuItem',
      'create' | 'update'
    >;
  }): void {
    if (!isDefined(engineComponentKey)) {
      return;
    }

    switch (engineComponentKey) {
      case EngineComponentKey.TRIGGER_WORKFLOW_VERSION: {
        if (!isNonEmptyString(workflowVersionId)) {
          validationResult.errors.push({
            code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
            message: t`workflowVersionId is required when engineComponentKey is TRIGGER_WORKFLOW_VERSION`,
            userFriendlyMessage: msg`Workflow version is required for workflow trigger items`,
          });
        }

        if (isNonEmptyString(frontComponentUniversalIdentifier)) {
          validationResult.errors.push({
            code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
            message: t`frontComponentId must not be set when engineComponentKey is TRIGGER_WORKFLOW_VERSION`,
            userFriendlyMessage: msg`Front component must not be set for workflow trigger items`,
          });
        }

        break;
      }
      case EngineComponentKey.FRONT_COMPONENT_RENDERER: {
        if (!isNonEmptyString(frontComponentUniversalIdentifier)) {
          validationResult.errors.push({
            code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
            message: t`frontComponentId is required when engineComponentKey is FRONT_COMPONENT_RENDERER`,
            userFriendlyMessage: msg`Front component is required for front component renderer items`,
          });
        }

        if (isNonEmptyString(workflowVersionId)) {
          validationResult.errors.push({
            code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
            message: t`workflowVersionId must not be set when engineComponentKey is FRONT_COMPONENT_RENDERER`,
            userFriendlyMessage: msg`Workflow version must not be set for front component renderer items`,
          });
        }

        break;
      }
      case EngineComponentKey.NAVIGATION: {
        this.validateNavigationPayload({ payload, validationResult });

        if (isNonEmptyString(workflowVersionId)) {
          validationResult.errors.push({
            code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
            message: t`workflowVersionId must not be set for engine component key ${engineComponentKey}`,
            userFriendlyMessage: msg`Workflow version must not be set for this item type`,
          });
        }

        if (isNonEmptyString(frontComponentUniversalIdentifier)) {
          validationResult.errors.push({
            code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
            message: t`frontComponentId must not be set for engine component key ${engineComponentKey}`,
            userFriendlyMessage: msg`Front component must not be set for this item type`,
          });
        }

        break;
      }
      default: {
        if (isNonEmptyString(workflowVersionId)) {
          validationResult.errors.push({
            code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
            message: t`workflowVersionId must not be set for engine component key ${engineComponentKey}`,
            userFriendlyMessage: msg`Workflow version must not be set for this item type`,
          });
        }

        if (isNonEmptyString(frontComponentUniversalIdentifier)) {
          validationResult.errors.push({
            code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
            message: t`frontComponentId must not be set for engine component key ${engineComponentKey}`,
            userFriendlyMessage: msg`Front component must not be set for this item type`,
          });
        }

        break;
      }
    }
  }

  private validateNavigationPayload({
    payload,
    validationResult,
  }: {
    payload: CommandMenuItemPayload | null;
    validationResult: FailedFlatEntityValidation<
      'commandMenuItem',
      'create' | 'update'
    >;
  }): void {
    if (!isDefined(payload)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`payload is required when engineComponentKey is NAVIGATION`,
        userFriendlyMessage: msg`Payload is required for navigation items`,
      });

      return;
    }

    const hasPath = 'path' in payload && isNonEmptyString(payload.path);
    const hasObjectMetadataItemId =
      'objectMetadataItemId' in payload &&
      isNonEmptyString(payload.objectMetadataItemId);

    if (!hasPath && !hasObjectMetadataItemId) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`payload must contain either a "path" or "objectMetadataItemId" property`,
        userFriendlyMessage: msg`Payload must contain either a path or an object metadata item identifier`,
      });
    }
  }
}
