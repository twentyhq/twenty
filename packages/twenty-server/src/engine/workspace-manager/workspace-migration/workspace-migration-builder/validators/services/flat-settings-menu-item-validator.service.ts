import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  isReservedSettingsMenuItemTitle,
  type SettingsMenuItemScope,
} from 'twenty-shared/application';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { SettingsMenuItemExceptionCode } from 'src/engine/metadata-modules/settings-menu-item/settings-menu-item.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityCreationValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-creation-validation-args.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type SettingsMenuItemPositionCollisionArgs = {
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
  scope: SettingsMenuItemScope;
  position: number;
  flatSettingsMenuItemMapsToSearch: MetadataUniversalFlatEntityMaps<'settingsMenuItem'>[];
};

// Two menu items of the same application sharing a position in the same scope would
// render in an order the manifest does not determine, so the sync refuses it
// rather than picking a winner.
const hasSettingsMenuItemPositionCollision = ({
  universalIdentifier,
  applicationUniversalIdentifier,
  scope,
  position,
  flatSettingsMenuItemMapsToSearch,
}: SettingsMenuItemPositionCollisionArgs): boolean =>
  flatSettingsMenuItemMapsToSearch.some((flatSettingsMenuItemMaps) =>
    Object.values(flatSettingsMenuItemMaps.byUniversalIdentifier).some(
      (existingSettingsMenuItem) =>
        isDefined(existingSettingsMenuItem) &&
        existingSettingsMenuItem.universalIdentifier !== universalIdentifier &&
        existingSettingsMenuItem.applicationUniversalIdentifier ===
          applicationUniversalIdentifier &&
        existingSettingsMenuItem.scope === scope &&
        existingSettingsMenuItem.position === position,
    ),
  );

@Injectable()
export class FlatSettingsMenuItemValidatorService {
  public validateFlatSettingsMenuItemCreation({
    flatEntityToValidate: flatSettingsMenuItem,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFrontComponentMaps,
    },
    finalFlatEntityMaps,
  }: FlatEntityCreationValidationArgs<
    typeof ALL_METADATA_NAME.settingsMenuItem
  >): FailedFlatEntityValidation<'settingsMenuItem', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatSettingsMenuItem.universalIdentifier,
        title: flatSettingsMenuItem.title,
      },
      metadataName: 'settingsMenuItem',
      type: 'create',
    });

    if (!isNonEmptyString(flatSettingsMenuItem.title)) {
      validationResult.errors.push({
        code: SettingsMenuItemExceptionCode.INVALID_SETTINGS_MENU_ITEM_INPUT,
        message: t`Settings menu item title is required`,
        userFriendlyMessage: msg`Settings menu item title is required`,
      });
    }

    if (
      isNonEmptyString(flatSettingsMenuItem.title) &&
      isReservedSettingsMenuItemTitle(flatSettingsMenuItem.title)
    ) {
      validationResult.errors.push({
        code: SettingsMenuItemExceptionCode.RESERVED_SETTINGS_MENU_ITEM_TITLE,
        message: t`Settings menu item title "${flatSettingsMenuItem.title}" is reserved`,
        userFriendlyMessage: msg`This settings menu item title is reserved.`,
      });
    }

    const frontComponent = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatSettingsMenuItem.frontComponentUniversalIdentifier,
      flatEntityMaps: flatFrontComponentMaps,
    });

    if (!isDefined(frontComponent)) {
      validationResult.errors.push({
        code: SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_FRONT_COMPONENT_NOT_FOUND,
        message: t`Front component "${flatSettingsMenuItem.frontComponentUniversalIdentifier}" not found`,
        userFriendlyMessage: msg`The front component this settings menu item renders was not found.`,
      });
    }

    if (
      hasSettingsMenuItemPositionCollision({
        universalIdentifier: flatSettingsMenuItem.universalIdentifier,
        applicationUniversalIdentifier:
          flatSettingsMenuItem.applicationUniversalIdentifier,
        scope: flatSettingsMenuItem.scope,
        position: flatSettingsMenuItem.position,
        flatSettingsMenuItemMapsToSearch: [finalFlatEntityMaps],
      })
    ) {
      validationResult.errors.push({
        code: SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_POSITION_ALREADY_TAKEN,
        message: t`Another settings menu item already uses position ${flatSettingsMenuItem.position}`,
        userFriendlyMessage: msg`Another settings menu item of this application already uses this position.`,
      });
    }

    return validationResult;
  }

  public validateFlatSettingsMenuItemUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSettingsMenuItemMaps: optimisticFlatSettingsMenuItemMaps,
      flatFrontComponentMaps,
    },
    finalFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.settingsMenuItem
  >): FailedFlatEntityValidation<'settingsMenuItem', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'settingsMenuItem',
      type: 'update',
    });

    const fromFlatSettingsMenuItem = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatSettingsMenuItemMaps,
    });

    if (!isDefined(fromFlatSettingsMenuItem)) {
      validationResult.errors.push({
        code: SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_NOT_FOUND,
        message: t`Settings menu item not found`,
        userFriendlyMessage: msg`Settings menu item not found.`,
      });

      return validationResult;
    }

    const updatedTitle = flatEntityUpdate.title;

    if (isDefined(updatedTitle)) {
      if (!isNonEmptyString(updatedTitle)) {
        validationResult.errors.push({
          code: SettingsMenuItemExceptionCode.INVALID_SETTINGS_MENU_ITEM_INPUT,
          message: t`Settings menu item title is required`,
          userFriendlyMessage: msg`Settings menu item title is required`,
        });
      } else if (isReservedSettingsMenuItemTitle(updatedTitle)) {
        validationResult.errors.push({
          code: SettingsMenuItemExceptionCode.RESERVED_SETTINGS_MENU_ITEM_TITLE,
          message: t`Settings menu item title "${updatedTitle}" is reserved`,
          userFriendlyMessage: msg`This settings menu item title is reserved.`,
        });
      }
    }

    const updatedFrontComponentUniversalIdentifier =
      flatEntityUpdate.frontComponentUniversalIdentifier;

    if (isDefined(updatedFrontComponentUniversalIdentifier)) {
      const frontComponent = findFlatEntityByUniversalIdentifier({
        universalIdentifier: updatedFrontComponentUniversalIdentifier,
        flatEntityMaps: flatFrontComponentMaps,
      });

      if (!isDefined(frontComponent)) {
        validationResult.errors.push({
          code: SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_FRONT_COMPONENT_NOT_FOUND,
          message: t`Front component "${updatedFrontComponentUniversalIdentifier}" not found`,
          userFriendlyMessage: msg`The front component this settings menu item renders was not found.`,
        });
      }
    }

    const nextPosition =
      flatEntityUpdate.position ?? fromFlatSettingsMenuItem.position;
    const nextScope = flatEntityUpdate.scope ?? fromFlatSettingsMenuItem.scope;

    if (
      hasSettingsMenuItemPositionCollision({
        universalIdentifier,
        applicationUniversalIdentifier:
          fromFlatSettingsMenuItem.applicationUniversalIdentifier,
        scope: nextScope,
        position: nextPosition,
        flatSettingsMenuItemMapsToSearch: [finalFlatEntityMaps],
      })
    ) {
      validationResult.errors.push({
        code: SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_POSITION_ALREADY_TAKEN,
        message: t`Another settings menu item already uses position ${nextPosition}`,
        userFriendlyMessage: msg`Another settings menu item of this application already uses this position.`,
      });
    }

    return validationResult;
  }

  public validateFlatSettingsMenuItemDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSettingsMenuItemMaps: optimisticFlatSettingsMenuItemMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.settingsMenuItem
  >): FailedFlatEntityValidation<'settingsMenuItem', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        title: flatEntityToValidate.title,
      },
      metadataName: 'settingsMenuItem',
      type: 'delete',
    });

    const existingSettingsMenuItem = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatSettingsMenuItemMaps,
    });

    if (!isDefined(existingSettingsMenuItem)) {
      validationResult.errors.push({
        code: SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_NOT_FOUND,
        message: t`Settings menu item not found`,
        userFriendlyMessage: msg`Settings menu item not found.`,
      });
    }

    return validationResult;
  }
}
