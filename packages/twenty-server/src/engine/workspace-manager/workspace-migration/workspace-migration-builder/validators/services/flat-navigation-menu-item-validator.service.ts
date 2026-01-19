import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration/utils/find-flat-entity-property-update.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';

@Injectable()
export class FlatNavigationMenuItemValidatorService {
  public validateFlatNavigationMenuItemCreation({
    flatEntityToValidate: flatNavigationMenuItem,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.navigationMenuItem
  >): FailedFlatEntityValidation<'navigationMenuItem', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatNavigationMenuItem.id,
        universalIdentifier: flatNavigationMenuItem.universalIdentifier,
      },
      metadataName: 'navigationMenuItem',
      type: 'create',
    });

    if (
      isDefined(flatNavigationMenuItem.position) &&
      flatNavigationMenuItem.position < 0
    ) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Position must be a non-negative integer`,
        userFriendlyMessage: msg`Position must be a non-negative integer`,
      });
    }

    return validationResult;
  }

  public validateFlatNavigationMenuItemDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.navigationMenuItem
  >): FailedFlatEntityValidation<'navigationMenuItem', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'navigationMenuItem',
      type: 'delete',
    });

    const existingNavigationMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatEntityToValidate.id,
      flatEntityMaps: optimisticFlatNavigationMenuItemMaps,
    });

    if (!isDefined(existingNavigationMenuItem)) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
        message: t`Navigation menu item not found`,
        userFriendlyMessage: msg`Navigation menu item not found`,
      });
    }

    return validationResult;
  }

  public validateFlatNavigationMenuItemUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.navigationMenuItem
  >): FailedFlatEntityValidation<'navigationMenuItem', 'update'> {
    const fromFlatNavigationMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: optimisticFlatNavigationMenuItemMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: fromFlatNavigationMenuItem?.universalIdentifier,
      },
      metadataName: 'navigationMenuItem',
      type: 'update',
    });

    if (!isDefined(fromFlatNavigationMenuItem)) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
        message: t`Navigation menu item not found`,
        userFriendlyMessage: msg`Navigation menu item not found`,
      });

      return validationResult;
    }

    const positionUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates,
      property: 'position',
    });

    if (isDefined(positionUpdate) && positionUpdate.to < 0) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Position must be a non-negative integer`,
        userFriendlyMessage: msg`Position must be a non-negative integer`,
      });
    }

    return validationResult;
  }
}
