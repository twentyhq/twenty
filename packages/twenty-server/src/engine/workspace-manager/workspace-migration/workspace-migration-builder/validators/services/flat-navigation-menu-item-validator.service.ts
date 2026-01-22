import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration/utils/find-flat-entity-property-update.util';
import { validateFlatEntityCircularDependency } from 'src/engine/workspace-manager/workspace-migration/utils/validate-flat-entity-circular-dependency.util';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

const NAVIGATION_MENU_ITEM_MAX_DEPTH = 2;

@Injectable()
export class FlatNavigationMenuItemValidatorService {
  private validateNavigationMenuItemType({
    hasTargetRecordId,
    hasTargetObjectMetadataId,
    hasViewId,
    name,
    isUpdate = false,
  }: {
    hasTargetRecordId: boolean;
    hasTargetObjectMetadataId: boolean;
    hasViewId: boolean;
    name: string | null | undefined;
    isUpdate?: boolean;
  }): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] {
    const errors: FlatEntityValidationError<NavigationMenuItemExceptionCode>[] =
      [];

    if (hasTargetObjectMetadataId && !hasTargetRecordId) {
      errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`targetRecordId is required when targetObjectMetadataId is provided`,
        userFriendlyMessage: msg`targetRecordId is required when targetObjectMetadataId is provided`,
      });
    }

    if (hasTargetRecordId && !hasTargetObjectMetadataId) {
      errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`targetObjectMetadataId is required when targetRecordId is provided`,
        userFriendlyMessage: msg`targetObjectMetadataId is required when targetRecordId is provided`,
      });
    }

    if (hasViewId && (hasTargetRecordId || hasTargetObjectMetadataId)) {
      errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`viewId cannot be provided together with targetRecordId or targetObjectMetadataId`,
        userFriendlyMessage: msg`viewId cannot be provided together with targetRecordId or targetObjectMetadataId`,
      });
    }

    const isFolder =
      !hasTargetRecordId && !hasTargetObjectMetadataId && !hasViewId;
    const isViewLink = hasViewId;
    const isRecordLink = hasTargetRecordId && hasTargetObjectMetadataId;
    const typeCount =
      (isFolder ? 1 : 0) + (isViewLink ? 1 : 0) + (isRecordLink ? 1 : 0);

    if (typeCount === 0) {
      errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Navigation menu item must be either a folder (with name), a view link (with viewId), or a record link (with targetRecordId and targetObjectMetadataId)`,
        userFriendlyMessage: msg`Navigation menu item must be either a folder (with name), a view link (with viewId), or a record link (with targetRecordId and targetObjectMetadataId)`,
      });
    }

    if (typeCount > 1) {
      errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Navigation menu item cannot be multiple types simultaneously`,
        userFriendlyMessage: msg`Navigation menu item cannot be multiple types simultaneously`,
      });
    }

    if (isFolder && (!isDefined(name) || name.trim() === '')) {
      errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: isUpdate
          ? t`Folder name is required and cannot be empty`
          : t`Folder name is required when creating a folder`,
        userFriendlyMessage: isUpdate
          ? msg`Folder name is required and cannot be empty`
          : msg`Folder name is required when creating a folder`,
      });
    }

    return errors;
  }

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

    const typeValidationErrors = this.validateNavigationMenuItemType({
      hasTargetRecordId: isDefined(flatNavigationMenuItem.targetRecordId),
      hasTargetObjectMetadataId: isDefined(
        flatNavigationMenuItem.targetObjectMetadataId,
      ),
      hasViewId: isDefined(flatNavigationMenuItem.viewId),
      name: flatNavigationMenuItem.name,
      isUpdate: false,
    });

    validationResult.errors.push(...typeValidationErrors);

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

    const nameUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates,
      property: 'name',
    });

    const typeValidationErrors = this.validateNavigationMenuItemType({
      hasTargetRecordId: isDefined(toFlatNavigationMenuItem.targetRecordId),
      hasTargetObjectMetadataId: isDefined(
        toFlatNavigationMenuItem.targetObjectMetadataId,
      ),
      hasViewId: isDefined(toFlatNavigationMenuItem.viewId),
      name: isDefined(nameUpdate)
        ? nameUpdate.to
        : toFlatNavigationMenuItem.name,
      isUpdate: true,
    });

    validationResult.errors.push(...typeValidationErrors);

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
