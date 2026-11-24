import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_ITEM_CONTAINER_TYPES } from 'src/engine/metadata-modules/flat-navigation-menu-item/constants/navigation-menu-item-container-types.constant';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { validateNavigationMenuItemHierarchy } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-hierarchy.util';
import { validateNavigationMenuItemTypeRequiredProperties } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-type-required-properties.util';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';
import { validateFlatEntityCircularDependency } from 'src/engine/workspace-manager/workspace-migration/utils/validate-flat-entity-circular-dependency.util';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

const NAVIGATION_MENU_ITEM_MAX_DEPTH =
  NAVIGATION_MENU_ITEM_CONTAINER_TYPES.length + 1;

@Injectable()
export class FlatNavigationMenuItemValidatorService {
  private getTypeChangeValidationErrors({
    toFlatNavigationMenuItem,
    isParentUpdated,
    flatNavigationMenuItemMaps,
  }: {
    toFlatNavigationMenuItem: Pick<
      UniversalFlatNavigationMenuItem,
      | 'type'
      | 'builtInSectionKey'
      | 'universalIdentifier'
      | 'parentUniversalIdentifier'
    >;
    isParentUpdated: boolean;
    flatNavigationMenuItemMaps: MetadataUniversalFlatEntityMaps<'navigationMenuItem'>;
  }): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] {
    const parentNavigationMenuItem =
      !isParentUpdated &&
      isDefined(toFlatNavigationMenuItem.parentUniversalIdentifier)
        ? findFlatEntityByUniversalIdentifier({
            universalIdentifier:
              toFlatNavigationMenuItem.parentUniversalIdentifier,
            flatEntityMaps: flatNavigationMenuItemMaps,
          })
        : undefined;

    const childTypes = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (navigationMenuItem) =>
          navigationMenuItem.parentUniversalIdentifier ===
          toFlatNavigationMenuItem.universalIdentifier,
      )
      .map((navigationMenuItem) => navigationMenuItem.type);

    return validateNavigationMenuItemHierarchy({
      type: toFlatNavigationMenuItem.type,
      builtInSectionKey: toFlatNavigationMenuItem.builtInSectionKey,
      parentType: parentNavigationMenuItem?.type,
      parentBuiltInSectionKey: parentNavigationMenuItem?.builtInSectionKey,
      childTypes,
    });
  }

  private getCircularDependencyValidationErrors({
    navigationMenuItemUniversalIdentifier,
    parentUniversalIdentifier,
    flatNavigationMenuItemMaps,
  }: {
    navigationMenuItemUniversalIdentifier: string;
    parentUniversalIdentifier: string;
    flatNavigationMenuItemMaps: MetadataUniversalFlatEntityMaps<'navigationMenuItem'>;
  }): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] {
    const circularDependencyResult = validateFlatEntityCircularDependency({
      flatEntityUniversalIdentifier: navigationMenuItemUniversalIdentifier,
      flatEntityParentUniversalIdentifier: parentUniversalIdentifier,
      maxDepth: NAVIGATION_MENU_ITEM_MAX_DEPTH,
      parentUniversalIdentifierKey: 'parentUniversalIdentifier',
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

  // Entering the flat maps resolves these references, so an unresolvable one
  // has to fail validation rather than throw there.
  private getUnresolvedReferenceValidationErrors({
    flatNavigationMenuItem,
    flatObjectMetadataMaps,
    flatViewMaps,
  }: {
    flatNavigationMenuItem: MetadataUniversalFlatEntity<'navigationMenuItem'>;
    flatObjectMetadataMaps: MetadataUniversalFlatEntityMaps<'objectMetadata'>;
    flatViewMaps: MetadataUniversalFlatEntityMaps<'view'>;
  }): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] {
    const errors: FlatEntityValidationError<NavigationMenuItemExceptionCode>[] =
      [];

    const { targetObjectMetadataUniversalIdentifier, viewUniversalIdentifier } =
      flatNavigationMenuItem;

    if (
      isDefined(targetObjectMetadataUniversalIdentifier) &&
      !isDefined(
        findFlatEntityByUniversalIdentifier({
          universalIdentifier: targetObjectMetadataUniversalIdentifier,
          flatEntityMaps: flatObjectMetadataMaps,
        }),
      )
    ) {
      errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Target object metadata not found`,
        userFriendlyMessage: msg`Target object not found`,
      });
    }

    if (
      isDefined(viewUniversalIdentifier) &&
      !isDefined(
        findFlatEntityByUniversalIdentifier({
          universalIdentifier: viewUniversalIdentifier,
          flatEntityMaps: flatViewMaps,
        }),
      )
    ) {
      errors.push({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Target view not found`,
        userFriendlyMessage: msg`Target view not found`,
      });
    }

    return errors;
  }

  public validateFlatNavigationMenuItemCreation({
    flatEntityToValidate: flatNavigationMenuItem,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
      flatObjectMetadataMaps,
      flatViewMaps,
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
      ...this.getUnresolvedReferenceValidationErrors({
        flatNavigationMenuItem,
        flatObjectMetadataMaps,
        flatViewMaps,
      }),
    );

    if (isDefined(flatNavigationMenuItem.parentUniversalIdentifier)) {
      const circularDependencyErrors =
        this.getCircularDependencyValidationErrors({
          navigationMenuItemUniversalIdentifier:
            flatNavigationMenuItem.universalIdentifier,
          parentUniversalIdentifier:
            flatNavigationMenuItem.parentUniversalIdentifier,
          flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
        });

      if (circularDependencyErrors.length > 0) {
        validationResult.errors.push(...circularDependencyErrors);
      }

      const referencedParentInOptimistic = findFlatEntityByUniversalIdentifier({
        universalIdentifier: flatNavigationMenuItem.parentUniversalIdentifier,
        flatEntityMaps: optimisticFlatNavigationMenuItemMaps,
      });

      const referencedParentInRemaining = findFlatEntityByUniversalIdentifier({
        universalIdentifier: flatNavigationMenuItem.parentUniversalIdentifier,
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

      const referencedParent =
        referencedParentInOptimistic ?? referencedParentInRemaining;

      validationResult.errors.push(
        ...validateNavigationMenuItemHierarchy({
          type: flatNavigationMenuItem.type,
          parentType: referencedParent?.type,
          parentBuiltInSectionKey: referencedParent?.builtInSectionKey,
        }),
      );
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

    const parentUniversalIdentifierUpdate =
      flatEntityUpdate.parentUniversalIdentifier;

    if (
      isDefined(flatEntityUpdate.type) &&
      flatEntityUpdate.type !== fromFlatNavigationMenuItem.type
    ) {
      validationResult.errors.push(
        ...this.getTypeChangeValidationErrors({
          toFlatNavigationMenuItem,
          isParentUpdated: isDefined(parentUniversalIdentifierUpdate),
          flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
        }),
      );
    }

    if (!isDefined(parentUniversalIdentifierUpdate)) {
      return validationResult;
    }

    const newParentUniversalIdentifier = parentUniversalIdentifierUpdate;

    const circularDependencyErrors = this.getCircularDependencyValidationErrors(
      {
        navigationMenuItemUniversalIdentifier:
          fromFlatNavigationMenuItem.universalIdentifier,
        parentUniversalIdentifier: newParentUniversalIdentifier,
        flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
      },
    );

    if (circularDependencyErrors.length > 0) {
      validationResult.errors.push(...circularDependencyErrors);
    }

    const referencedParentNavigationMenuItem =
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: newParentUniversalIdentifier,
        flatEntityMaps: optimisticFlatNavigationMenuItemMaps,
      });

    if (!isDefined(referencedParentNavigationMenuItem)) {
      validationResult.errors.push({
        code: NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
        message: t`Parent navigation menu item not found`,
        userFriendlyMessage: msg`Parent navigation menu item not found`,
      });
    }

    validationResult.errors.push(
      ...validateNavigationMenuItemHierarchy({
        type: toFlatNavigationMenuItem.type,
        parentType: referencedParentNavigationMenuItem?.type,
        parentBuiltInSectionKey:
          referencedParentNavigationMenuItem?.builtInSectionKey,
      }),
    );

    return validationResult;
  }
}
