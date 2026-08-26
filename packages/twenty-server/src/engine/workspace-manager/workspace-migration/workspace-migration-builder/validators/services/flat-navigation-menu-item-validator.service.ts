import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { validateNavigationMenuItemTypeRequiredProperties } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-type-required-properties.util';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { validateFlatEntityCircularDependency } from 'src/engine/workspace-manager/workspace-migration/utils/validate-flat-entity-circular-dependency.util';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

const NAVIGATION_MENU_ITEM_MAX_DEPTH = 2;

@Injectable()
export class FlatNavigationMenuItemValidatorService {
  private getCircularDependencyValidationErrors({
    navigationMenuItemUniversalIdentifier,
    folderUniversalIdentifier,
    flatNavigationMenuItemMaps,
  }: {
    navigationMenuItemUniversalIdentifier: string;
    folderUniversalIdentifier: string;
    flatNavigationMenuItemMaps: MetadataUniversalFlatEntityMaps<'navigationMenuItem'>;
  }): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] {
    const circularDependencyResult = validateFlatEntityCircularDependency({
      flatEntityUniversalIdentifier: navigationMenuItemUniversalIdentifier,
      flatEntityParentUniversalIdentifier: folderUniversalIdentifier,
      maxDepth: NAVIGATION_MENU_ITEM_MAX_DEPTH,
      parentUniversalIdentifierKey: 'folderUniversalIdentifier',
      flatEntityMaps: flatNavigationMenuItemMaps,
    });

    if (circularDependencyResult.status === 'success') {
      return [];
    }

    switch (circularDependencyResult.reason) {
      case 'self_reference':
        return [
          {
            code: NavigationMenuItemExceptionCode.CIRCULAR_DEPENDENCY,
            message: t`Navigation menu item cannot be its own parent`,
            userFriendlyMessage: msg`Navigation menu item cannot be its own parent`,
          },
        ];
      case 'circular_dependency':
        return [
          {
            code: NavigationMenuItemExceptionCode.CIRCULAR_DEPENDENCY,
            message: t`Circular dependency detected in navigation menu item hierarchy`,
            userFriendlyMessage: msg`Circular dependency detected in navigation menu item hierarchy`,
          },
        ];
      case 'max_depth_exceeded':
        return [
          {
            code: NavigationMenuItemExceptionCode.MAX_DEPTH_EXCEEDED,
            message: t`Navigation menu item hierarchy exceeds maximum depth of ${NAVIGATION_MENU_ITEM_MAX_DEPTH}`,
            userFriendlyMessage: msg`Navigation menu item hierarchy exceeds maximum depth of ${NAVIGATION_MENU_ITEM_MAX_DEPTH}`,
          },
        ];
    }
  }

  public validateFlatNavigationMenuItemCreation({
    flatEntityToValidate: flatNavigationMenuItem,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
    },
    remainingFlatEntityMapsToValidate,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.navigationMenuItem
  >): FailedFlatEntityValidation<'navigationMenuItem', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatNavigationMenuItem.universalIdentifier,
        name: flatNavigationMenuItem.name,
        type: flatNavigationMenuItem.type,
      },
      metadataName: 'navigationMenuItem',
      type: 'create',
    });

    if (
      isDefined(flatNavigationMenuItem.position) &&
      !Number.isFinite(flatNavigationMenuItem.position)
    ) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Position must be a finite number`,
        userFriendlyMessage: msg`Position must be a finite number`,
      });
    }

    validationResult.errors.push(
      ...validateNavigationMenuItemTypeRequiredProperties({
        flatNavigationMenuItem,
      }),
    );

    if (isDefined(flatNavigationMenuItem.folderUniversalIdentifier)) {
      const circularDependencyErrors =
        this.getCircularDependencyValidationErrors({
          navigationMenuItemUniversalIdentifier:
            flatNavigationMenuItem.universalIdentifier,
          folderUniversalIdentifier:
            flatNavigationMenuItem.folderUniversalIdentifier,
          flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
        });

      if (circularDependencyErrors.length > 0) {
        validationResult.errors.push(...circularDependencyErrors);
      }

      const referencedParentInOptimistic = findFlatEntityByUniversalIdentifier({
        universalIdentifier: flatNavigationMenuItem.folderUniversalIdentifier,
        flatEntityMaps: optimisticFlatNavigationMenuItemMaps,
      });

      const referencedParentInRemaining = findFlatEntityByUniversalIdentifier({
        universalIdentifier: flatNavigationMenuItem.folderUniversalIdentifier,
        flatEntityMaps: remainingFlatEntityMapsToValidate,
      });

      if (
        !isDefined(referencedParentInOptimistic) &&
        !isDefined(referencedParentInRemaining)
      ) {
        validationResult.errors.push({
          code: NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
          message: t`Parent navigation menu item not found`,
          userFriendlyMessage: msg`Parent navigation menu item not found`,
        });
      }
    }

    return validationResult;
  }

  public validateFlatNavigationMenuItemDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.navigationMenuItem
  >): FailedFlatEntityValidation<'navigationMenuItem', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
        type: flatEntityToValidate.type,
      },
      metadataName: 'navigationMenuItem',
      type: 'delete',
    });

    const existingNavigationMenuItem = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
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
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.navigationMenuItem
  >): FailedFlatEntityValidation<'navigationMenuItem', 'update'> {
    const fromFlatNavigationMenuItem = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatNavigationMenuItemMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
        name: flatEntityUpdate.name ?? fromFlatNavigationMenuItem?.name,
        type: flatEntityUpdate.type ?? fromFlatNavigationMenuItem?.type,
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

    const positionUpdate = flatEntityUpdate.position;

    if (isDefined(positionUpdate) && !Number.isFinite(positionUpdate)) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Position must be a finite number`,
        userFriendlyMessage: msg`Position must be a finite number`,
      });
    }

    const toFlatNavigationMenuItem = {
      ...fromFlatNavigationMenuItem,
      ...flatEntityUpdate,
    };

    validationResult.errors.push(
      ...validateNavigationMenuItemTypeRequiredProperties({
        flatNavigationMenuItem: toFlatNavigationMenuItem,
      }),
    );

    const folderUniversalIdentifierUpdate =
      flatEntityUpdate.folderUniversalIdentifier;

    if (!isDefined(folderUniversalIdentifierUpdate)) {
      return validationResult;
    }

    const newFolderUniversalIdentifier = folderUniversalIdentifierUpdate;

    const circularDependencyErrors = this.getCircularDependencyValidationErrors(
      {
        navigationMenuItemUniversalIdentifier:
          fromFlatNavigationMenuItem.universalIdentifier,
        folderUniversalIdentifier: newFolderUniversalIdentifier,
        flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
      },
    );

    if (circularDependencyErrors.length > 0) {
      validationResult.errors.push(...circularDependencyErrors);
    }

    const referencedParentNavigationMenuItem =
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: newFolderUniversalIdentifier,
        flatEntityMaps: optimisticFlatNavigationMenuItemMaps,
      });

    if (!isDefined(referencedParentNavigationMenuItem)) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
        message: t`Parent navigation menu item not found`,
        userFriendlyMessage: msg`Parent navigation menu item not found`,
      });
    }

    return validationResult;
  }
}
