import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuItemExceptionCode } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
import { type PathCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/path-command-menu-item-payload.type';
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
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatCommandMenuItemMaps: optimisticFlatCommandMenuItemMaps,
    },
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
      coreWorkflowVersionId: flatCommandMenuItem.coreWorkflowVersionId,
      frontComponentUniversalIdentifier:
        flatCommandMenuItem.frontComponentUniversalIdentifier,
      payload: flatCommandMenuItem.payload,
      navigationTargetObjectMetadataUniversalIdentifier:
        flatCommandMenuItem.navigationTargetObjectMetadataUniversalIdentifier,
      validationResult,
    });

    if (
      isDefined(
        findFlatEntityByUniversalIdentifier({
          universalIdentifier: flatCommandMenuItem.universalIdentifier,
          flatEntityMaps: optimisticFlatCommandMenuItemMaps,
        }),
      )
    ) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`Command menu item with same universal identifier already exists`,
        userFriendlyMessage: msg`Command menu item already exists`,
      });
    }

    this.validateNavigationTarget({
      navigationTargetObjectMetadataUniversalIdentifier:
        flatCommandMenuItem.navigationTargetObjectMetadataUniversalIdentifier,
      flatObjectMetadataMaps,
      validationResult,
    });

    this.validateRecordFieldAvailability({
      availabilityType: flatCommandMenuItem.availabilityType,
      availabilityObjectMetadataUniversalIdentifier:
        flatCommandMenuItem.availabilityObjectMetadataUniversalIdentifier,
      availabilityFieldMetadataUniversalIdentifier:
        flatCommandMenuItem.availabilityFieldMetadataUniversalIdentifier,
      flatFieldMetadataMaps,
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
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
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

    const navigationTargetObjectMetadataUniversalIdentifier =
      flatEntityUpdate.navigationTargetObjectMetadataUniversalIdentifier !==
      undefined
        ? flatEntityUpdate.navigationTargetObjectMetadataUniversalIdentifier
        : fromFlatCommandMenuItem.navigationTargetObjectMetadataUniversalIdentifier;

    this.validateEngineComponentKeyCoherence({
      engineComponentKey,
      workflowVersionId: fromFlatCommandMenuItem.workflowVersionId,
      coreWorkflowVersionId: fromFlatCommandMenuItem.coreWorkflowVersionId,
      frontComponentUniversalIdentifier:
        fromFlatCommandMenuItem.frontComponentUniversalIdentifier,
      payload,
      navigationTargetObjectMetadataUniversalIdentifier,
      validationResult,
    });

    this.validateNavigationTarget({
      navigationTargetObjectMetadataUniversalIdentifier,
      flatObjectMetadataMaps,
      validationResult,
    });

    this.validateRecordFieldAvailability({
      availabilityType:
        flatEntityUpdate.availabilityType ??
        fromFlatCommandMenuItem.availabilityType,
      availabilityObjectMetadataUniversalIdentifier:
        flatEntityUpdate.availabilityObjectMetadataUniversalIdentifier !==
        undefined
          ? flatEntityUpdate.availabilityObjectMetadataUniversalIdentifier
          : fromFlatCommandMenuItem.availabilityObjectMetadataUniversalIdentifier,
      availabilityFieldMetadataUniversalIdentifier:
        flatEntityUpdate.availabilityFieldMetadataUniversalIdentifier !==
        undefined
          ? flatEntityUpdate.availabilityFieldMetadataUniversalIdentifier
          : fromFlatCommandMenuItem.availabilityFieldMetadataUniversalIdentifier,
      flatFieldMetadataMaps,
      validationResult,
    });

    return validationResult;
  }

  private validateRecordFieldAvailability({
    availabilityType,
    availabilityObjectMetadataUniversalIdentifier,
    availabilityFieldMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
    validationResult,
  }: {
    availabilityType: CommandMenuItemAvailabilityType;
    availabilityObjectMetadataUniversalIdentifier: string | null;
    availabilityFieldMetadataUniversalIdentifier: string | null;
    flatFieldMetadataMaps: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.commandMenuItem
    >['optimisticFlatEntityMapsAndRelatedFlatEntityMaps']['flatFieldMetadataMaps'];
    validationResult: FailedFlatEntityValidation<
      'commandMenuItem',
      'create' | 'update'
    >;
  }): void {
    if (availabilityType !== CommandMenuItemAvailabilityType.RECORD_FIELD) {
      if (isDefined(availabilityFieldMetadataUniversalIdentifier)) {
        validationResult.errors.push({
          code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
          message: t`Availability field metadata requires availability type RECORD_FIELD`,
          userFriendlyMessage: msg`Only record field command menu items can target a field`,
        });
      }

      return;
    }

    if (
      !isDefined(availabilityObjectMetadataUniversalIdentifier) ||
      !isDefined(availabilityFieldMetadataUniversalIdentifier)
    ) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`Availability type RECORD_FIELD requires availability object and field metadata`,
        userFriendlyMessage: msg`Record field command menu items need an object and a field`,
      });

      return;
    }

    const availabilityFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: availabilityFieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(availabilityFlatFieldMetadata)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`Availability field metadata not found`,
        userFriendlyMessage: msg`Field not found`,
      });

      return;
    }

    if (
      availabilityFlatFieldMetadata.objectMetadataUniversalIdentifier !==
      availabilityObjectMetadataUniversalIdentifier
    ) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`Availability field metadata does not belong to the availability object metadata`,
        userFriendlyMessage: msg`Field does not belong to the object`,
      });
    }
  }

  private validateNavigationTarget({
    navigationTargetObjectMetadataUniversalIdentifier,
    flatObjectMetadataMaps,
    validationResult,
  }: {
    navigationTargetObjectMetadataUniversalIdentifier: string | null;
    flatObjectMetadataMaps: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.commandMenuItem
    >['optimisticFlatEntityMapsAndRelatedFlatEntityMaps']['flatObjectMetadataMaps'];
    validationResult: FailedFlatEntityValidation<
      'commandMenuItem',
      'create' | 'update'
    >;
  }): void {
    if (!isDefined(navigationTargetObjectMetadataUniversalIdentifier)) {
      return;
    }

    const navigationTargetFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: navigationTargetObjectMetadataUniversalIdentifier,
        flatEntityMaps: flatObjectMetadataMaps,
      });

    if (!isDefined(navigationTargetFlatObjectMetadata)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`Navigation target object metadata not found`,
        userFriendlyMessage: msg`Navigation target object not found`,
      });
    }
  }

  private validateEngineComponentKeyCoherence({
    engineComponentKey,
    workflowVersionId,
    coreWorkflowVersionId,
    frontComponentUniversalIdentifier,
    payload,
    navigationTargetObjectMetadataUniversalIdentifier,
    validationResult,
  }: {
    engineComponentKey: EngineComponentKey | null;
    workflowVersionId: string | null;
    coreWorkflowVersionId: string | null;
    frontComponentUniversalIdentifier: string | null;
    payload: PathCommandMenuItemPayload | null;
    navigationTargetObjectMetadataUniversalIdentifier: string | null;
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
        if (
          !isNonEmptyString(workflowVersionId) &&
          !isNonEmptyString(coreWorkflowVersionId)
        ) {
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

        if (
          isNonEmptyString(workflowVersionId) ||
          isNonEmptyString(coreWorkflowVersionId)
        ) {
          validationResult.errors.push({
            code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
            message: t`workflowVersionId must not be set when engineComponentKey is FRONT_COMPONENT_RENDERER`,
            userFriendlyMessage: msg`Workflow version must not be set for front component renderer items`,
          });
        }

        break;
      }
      case EngineComponentKey.NAVIGATION: {
        this.validateNavigationPayload({
          payload,
          navigationTargetObjectMetadataUniversalIdentifier,
          validationResult,
        });

        if (
          isNonEmptyString(workflowVersionId) ||
          isNonEmptyString(coreWorkflowVersionId)
        ) {
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
        if (
          isNonEmptyString(workflowVersionId) ||
          isNonEmptyString(coreWorkflowVersionId)
        ) {
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
    navigationTargetObjectMetadataUniversalIdentifier,
    validationResult,
  }: {
    payload: PathCommandMenuItemPayload | null;
    navigationTargetObjectMetadataUniversalIdentifier: string | null;
    validationResult: FailedFlatEntityValidation<
      'commandMenuItem',
      'create' | 'update'
    >;
  }): void {
    // Pre-2-38 upgrade commands replayed during sequential upgrades still
    // produce the { objectMetadataItemId } shape, dual-written with the
    // foreign key by the 2-35 backfill; the 2-38 slow migration erases it.
    if (isObjectMetadataCommandMenuItemPayload(payload)) {
      return;
    }

    if (!isDefined(payload)) {
      if (!isDefined(navigationTargetObjectMetadataUniversalIdentifier)) {
        validationResult.errors.push({
          code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
          message: t`either a path payload or navigationTargetObjectMetadataId is required when engineComponentKey is NAVIGATION`,
          userFriendlyMessage: msg`A path or a navigation target object is required for navigation items`,
        });
      }

      return;
    }

    if (isDefined(navigationTargetObjectMetadataUniversalIdentifier)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`payload and navigationTargetObjectMetadataId are mutually exclusive`,
        userFriendlyMessage: msg`A navigation item cannot carry both a path and a navigation target object`,
      });

      return;
    }

    if (!('path' in payload) || !isNonEmptyString(payload.path)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`payload must contain a non-empty "path" property`,
        userFriendlyMessage: msg`Payload must contain a path`,
      });
    }
  }
}
