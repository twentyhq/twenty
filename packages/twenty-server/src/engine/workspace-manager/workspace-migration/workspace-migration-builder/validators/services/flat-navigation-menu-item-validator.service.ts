import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration/utils/find-flat-entity-property-update.util';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';
import { validateFlatEntityCircularDependency } from 'src/engine/workspace-manager/workspace-migration/utils/validate-flat-entity-circular-dependency.util';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';

const NAVIGATION_MENU_ITEM_MAX_DEPTH = 2;

@Injectable()
export class FlatNavigationMenuItemValidatorService {
  private getCircularDependencyValidationErrors({
    navigationMenuItemId,
    folderId,
    flatNavigationMenuItemMaps,
  }: {
    navigationMenuItemId: string;
    folderId: string;
    flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
  }): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] {
    const circularDependencyResult = validateFlatEntityCircularDependency({
      flatEntityId: navigationMenuItemId,
      flatEntityParentId: folderId,
      maxDepth: NAVIGATION_MENU_ITEM_MAX_DEPTH,
      parentIdKey: 'folderId',
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
      (!Number.isInteger(flatNavigationMenuItem.position) ||
        flatNavigationMenuItem.position < 0)
    ) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Position must be a non-negative integer`,
        userFriendlyMessage: msg`Position must be a non-negative integer`,
      });
    }

    const hasTargetRecordId = isDefined(flatNavigationMenuItem.targetRecordId);
    const hasTargetObjectMetadataId = isDefined(
      flatNavigationMenuItem.targetObjectMetadataId,
    );
    const hasViewId = isDefined(flatNavigationMenuItem.viewId);

    if (hasTargetObjectMetadataId && !hasTargetRecordId) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`targetRecordId is required when targetObjectMetadataId is provided`,
        userFriendlyMessage: msg`targetRecordId is required when targetObjectMetadataId is provided`,
      });
    }

    if (hasTargetRecordId && !hasTargetObjectMetadataId) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`targetObjectMetadataId is required when targetRecordId is provided`,
        userFriendlyMessage: msg`targetObjectMetadataId is required when targetRecordId is provided`,
      });
    }

    const isFolder =
      !hasTargetRecordId && !hasTargetObjectMetadataId && !hasViewId;

    if (
      isFolder &&
      (!isDefined(flatNavigationMenuItem.name) ||
        flatNavigationMenuItem.name.trim() === '')
    ) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Folder name is required when creating a folder`,
        userFriendlyMessage: msg`Folder name is required when creating a folder`,
      });
    }

    if (isDefined(flatNavigationMenuItem.folderId)) {
      const circularDependencyErrors =
        this.getCircularDependencyValidationErrors({
          navigationMenuItemId: flatNavigationMenuItem.id,
          folderId: flatNavigationMenuItem.folderId,
          flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
        });

      if (circularDependencyErrors.length > 0) {
        validationResult.errors.push(...circularDependencyErrors);
      }

      const referencedParentInOptimistic = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatNavigationMenuItem.folderId,
        flatEntityMaps: optimisticFlatNavigationMenuItemMaps,
      });

      const referencedParentInRemaining = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatNavigationMenuItem.folderId,
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

    if (
      isDefined(positionUpdate) &&
      (!Number.isInteger(positionUpdate.to) || positionUpdate.to < 0)
    ) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Position must be a non-negative integer`,
        userFriendlyMessage: msg`Position must be a non-negative integer`,
      });
    }

    const toFlatNavigationMenuItem = {
      ...fromFlatNavigationMenuItem,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    const hasTargetRecordId = isDefined(
      toFlatNavigationMenuItem.targetRecordId,
    );
    const hasTargetObjectMetadataId = isDefined(
      toFlatNavigationMenuItem.targetObjectMetadataId,
    );
    const hasViewId = isDefined(toFlatNavigationMenuItem.viewId);

    if (hasTargetObjectMetadataId && !hasTargetRecordId) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`targetRecordId is required when targetObjectMetadataId is provided`,
        userFriendlyMessage: msg`targetRecordId is required when targetObjectMetadataId is provided`,
      });
    }

    if (hasTargetRecordId && !hasTargetObjectMetadataId) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`targetObjectMetadataId is required when targetRecordId is provided`,
        userFriendlyMessage: msg`targetObjectMetadataId is required when targetRecordId is provided`,
      });
    }

    const nameUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates,
      property: 'name',
    });

    const isFolder =
      !hasTargetRecordId && !hasTargetObjectMetadataId && !hasViewId;

    if (
      isFolder &&
      isDefined(nameUpdate) &&
      (!isDefined(nameUpdate.to) || (nameUpdate.to as string).trim() === '')
    ) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Folder name is required and cannot be empty`,
        userFriendlyMessage: msg`Folder name is required and cannot be empty`,
      });
    }

    const folderIdUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates,
      property: 'folderId',
    });

    if (!isDefined(folderIdUpdate)) {
      return validationResult;
    }

    const newFolderId = folderIdUpdate.to;

    if (!isDefined(newFolderId)) {
      return validationResult;
    }

    const circularDependencyErrors = this.getCircularDependencyValidationErrors(
      {
        navigationMenuItemId: flatEntityId,
        folderId: newFolderId,
        flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
      },
    );

    if (circularDependencyErrors.length > 0) {
      validationResult.errors.push(...circularDependencyErrors);
    }

    const referencedParentNavigationMenuItem =
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: newFolderId,
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
