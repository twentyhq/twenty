import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuItemExceptionCode } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { type CommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item-payload.union';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatCommandMenuItemValidatorService {
  public validateFlatCommandMenuItemCreation({
    flatEntityToValidate: flatCommandMenuItem,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
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
      frontComponentUniversalIdentifier:
        flatCommandMenuItem.frontComponentUniversalIdentifier,
      payload: flatCommandMenuItem.payload,
      validationResult,
    });

    this.validateSystemUniversalIdentifierReservation({
      universalIdentifier: flatCommandMenuItem.universalIdentifier,
      isSystemSideEffect: flatCommandMenuItem.isSystemSideEffect,
      optimisticFlatCommandMenuItemMaps,
      validationResult,
    });

    this.validateObjectNavigationSingleton({
      engineComponentKey: flatCommandMenuItem.engineComponentKey,
      payload: flatCommandMenuItem.payload,
      isSystemSideEffect: flatCommandMenuItem.isSystemSideEffect,
      universalIdentifier: flatCommandMenuItem.universalIdentifier,
      optimisticFlatCommandMenuItemMaps,
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

    // Only an update that changes the payload or the engine component key can
    // turn a row into an object navigation command, so the singleton guard is
    // scoped to those updates and tolerates pre-re-own rows being updated in
    // place (isActive follow on a legacy identifier).
    if (
      flatEntityUpdate.payload !== undefined ||
      isDefined(flatEntityUpdate.engineComponentKey)
    ) {
      this.validateObjectNavigationSingleton({
        engineComponentKey,
        payload,
        isSystemSideEffect: fromFlatCommandMenuItem.isSystemSideEffect,
        universalIdentifier,
        optimisticFlatCommandMenuItemMaps,
        validationResult,
      });
    }

    return validationResult;
  }

  // Non-system callers cannot claim a universal identifier already held by an
  // engine-owned (isSystemSideEffect) row: squatting a standard action command
  // or an object navigation command UID fails loudly instead of silently
  // winning. Mirrors the side-effect engine collision detection for rows that
  // are not produced by a metadata operation.
  private validateSystemUniversalIdentifierReservation({
    universalIdentifier,
    isSystemSideEffect,
    optimisticFlatCommandMenuItemMaps,
    validationResult,
  }: {
    universalIdentifier: string;
    isSystemSideEffect: boolean;
    optimisticFlatCommandMenuItemMaps: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.commandMenuItem
    >['optimisticFlatEntityMapsAndRelatedFlatEntityMaps']['flatCommandMenuItemMaps'];
    validationResult: FailedFlatEntityValidation<'commandMenuItem', 'create'>;
  }): void {
    if (isSystemSideEffect === true) {
      return;
    }

    const existingFlatCommandMenuItem = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatCommandMenuItemMaps,
    });

    if (
      isDefined(existingFlatCommandMenuItem) &&
      existingFlatCommandMenuItem.isSystemSideEffect === true
    ) {
      validationResult.errors.push({
        code: MetadataSideEffectExceptionCode.RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER,
        message: t`Universal identifier is reserved for system-managed metadata`,
        userFriendlyMessage: msg`This identifier is reserved by the system`,
      });
    }
  }

  // A NAVIGATION item whose payload carries an objectMetadataItemId is the
  // engine-owned singleton navigation command of that object: it must be
  // isSystemSideEffect and must be the only one for the object (two of them
  // are two identical rows sharing a hotkey). Path-based
  // NAVIGATION items (payload: { path }) share the engine key but are a
  // legitimate authoring surface and are not caught.
  private validateObjectNavigationSingleton({
    engineComponentKey,
    payload,
    isSystemSideEffect,
    universalIdentifier,
    optimisticFlatCommandMenuItemMaps,
    validationResult,
  }: {
    engineComponentKey: EngineComponentKey | null;
    payload: CommandMenuItemPayload | null;
    isSystemSideEffect: boolean;
    universalIdentifier: string;
    optimisticFlatCommandMenuItemMaps: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.commandMenuItem
    >['optimisticFlatEntityMapsAndRelatedFlatEntityMaps']['flatCommandMenuItemMaps'];
    validationResult: FailedFlatEntityValidation<
      'commandMenuItem',
      'create' | 'update'
    >;
  }): void {
    if (engineComponentKey !== EngineComponentKey.NAVIGATION) {
      return;
    }

    if (!isObjectMetadataCommandMenuItemPayload(payload)) {
      return;
    }

    if (isSystemSideEffect !== true) {
      validationResult.errors.push({
        code: MetadataSideEffectExceptionCode.RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER,
        message: t`Object navigation command menu items are reserved for the engine-owned default command; remove the objectMetadataItemId payload from the command menu item definition`,
        userFriendlyMessage: msg`Object navigation commands are reserved for the system`,
      });
    }

    const duplicateNavigationFlatCommandMenuItem = Object.values(
      optimisticFlatCommandMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (existingFlatCommandMenuItem) =>
          existingFlatCommandMenuItem.universalIdentifier !==
            universalIdentifier &&
          existingFlatCommandMenuItem.engineComponentKey ===
            EngineComponentKey.NAVIGATION &&
          isObjectMetadataCommandMenuItemPayload(
            existingFlatCommandMenuItem.payload,
          ) &&
          existingFlatCommandMenuItem.payload.objectMetadataItemId ===
            payload.objectMetadataItemId,
      );

    if (isDefined(duplicateNavigationFlatCommandMenuItem)) {
      validationResult.errors.push({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: t`Object already has a navigation command menu item`,
        userFriendlyMessage: msg`This object already has a navigation command`,
      });
    }
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
