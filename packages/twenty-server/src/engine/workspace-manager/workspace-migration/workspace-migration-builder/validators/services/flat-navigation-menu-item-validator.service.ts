import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
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
        flatNavigationMenuItem.targetObjectMetadataUniversalIdentifier,
      ),
      hasViewId: isDefined(flatNavigationMenuItem.viewUniversalIdentifier),
      name: flatNavigationMenuItem.name,
      isUpdate: false,
    });

    validationResult.errors.push(...typeValidationErrors);

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

    if (
      isDefined(positionUpdate) &&
      (!Number.isInteger(positionUpdate) || positionUpdate < 0)
    ) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Position must be a non-negative integer`,
        userFriendlyMessage: msg`Position must be a non-negative integer`,
      });
    }

    const toFlatNavigationMenuItem = {
      ...fromFlatNavigationMenuItem,
      ...flatEntityUpdate,
    };

    const nameUpdate = flatEntityUpdate.name;

    const typeValidationErrors = this.validateNavigationMenuItemType({
      hasTargetRecordId: isDefined(toFlatNavigationMenuItem.targetRecordId),
      hasTargetObjectMetadataId: isDefined(
        toFlatNavigationMenuItem.targetObjectMetadataUniversalIdentifier,
      ),
      hasViewId: isDefined(toFlatNavigationMenuItem.viewUniversalIdentifier),
      name: isDefined(nameUpdate) ? nameUpdate : toFlatNavigationMenuItem.name,
      isUpdate: true,
    });

    validationResult.errors.push(...typeValidationErrors);

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
