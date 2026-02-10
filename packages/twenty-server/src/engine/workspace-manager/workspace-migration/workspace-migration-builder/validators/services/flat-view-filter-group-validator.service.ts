import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewFilterGroupExceptionCode } from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { validateFlatEntityCircularDependency } from 'src/engine/workspace-manager/workspace-migration/utils/validate-flat-entity-circular-dependency.util';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

// View filter groups can have at most 2 levels of nesting (root and one child level)
const VIEW_FILTER_GROUP_MAX_DEPTH = 2;

@Injectable()
export class FlatViewFilterGroupValidatorService {
  constructor() {}

  private getCircularDependencyValidationErrors({
    viewFilterGroupUniversalIdentifier,
    parentViewFilterGroupUniversalIdentifier,
    flatViewFilterGroupMaps,
  }: {
    viewFilterGroupUniversalIdentifier: string;
    parentViewFilterGroupUniversalIdentifier: string;
    flatViewFilterGroupMaps: MetadataUniversalFlatEntityMaps<'viewFilterGroup'>;
  }): FlatEntityValidationError<ViewFilterGroupExceptionCode>[] {
    const circularDependencyResult = validateFlatEntityCircularDependency({
      flatEntityUniversalIdentifier: viewFilterGroupUniversalIdentifier,
      flatEntityParentUniversalIdentifier:
        parentViewFilterGroupUniversalIdentifier,
      maxDepth: VIEW_FILTER_GROUP_MAX_DEPTH,
      parentUniversalIdentifierKey: 'parentViewFilterGroupUniversalIdentifier',
      flatEntityMaps: flatViewFilterGroupMaps,
    });

    if (circularDependencyResult.status === 'success') {
      return [];
    }

    switch (circularDependencyResult.reason) {
      case 'self_reference':
        return [
          {
            code: ViewFilterGroupExceptionCode.CIRCULAR_DEPENDENCY,
            message: t`View filter group cannot be its own parent`,
            userFriendlyMessage: msg`View filter group cannot be its own parent`,
          },
        ];
      case 'circular_dependency':
        return [
          {
            code: ViewFilterGroupExceptionCode.CIRCULAR_DEPENDENCY,
            message: t`Circular dependency detected in view filter group hierarchy`,
            userFriendlyMessage: msg`Circular dependency detected in view filter group hierarchy`,
          },
        ];
      case 'max_depth_exceeded':
        return [
          {
            code: ViewFilterGroupExceptionCode.MAX_DEPTH_EXCEEDED,
            message: t`View filter group hierarchy exceeds maximum depth of ${VIEW_FILTER_GROUP_MAX_DEPTH}`,
            userFriendlyMessage: msg`View filter group hierarchy exceeds maximum depth of ${VIEW_FILTER_GROUP_MAX_DEPTH}`,
          },
        ];
    }
  }

  validateFlatViewFilterGroupCreation({
    flatEntityToValidate: flatViewFilterGroupToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFilterGroupMaps: optimisticFlatViewFilterGroupMaps,
      flatViewMaps,
    },
    remainingFlatEntityMapsToValidate,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFilterGroup
  >): FailedFlatEntityValidation<'viewFilterGroup', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatViewFilterGroupToValidate.universalIdentifier,
      },
      metadataName: 'viewFilterGroup',
      type: 'create',
    });

    const existingViewFilterGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewFilterGroupToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatViewFilterGroupMaps,
    });

    if (isDefined(existingViewFilterGroup)) {
      validationResult.errors.push({
        code: ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA,
        message: t`View filter group with this universal identifier already exists`,
        userFriendlyMessage: msg`View filter group already exists`,
      });
    }

    const referencedView = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatViewFilterGroupToValidate.viewUniversalIdentifier,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(referencedView)) {
      validationResult.errors.push({
        code: ViewFilterGroupExceptionCode.VIEW_NOT_FOUND,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });
    }

    if (
      isDefined(
        flatViewFilterGroupToValidate.parentViewFilterGroupUniversalIdentifier,
      )
    ) {
      const circularDependencyErrors =
        this.getCircularDependencyValidationErrors({
          viewFilterGroupUniversalIdentifier:
            flatViewFilterGroupToValidate.universalIdentifier,
          parentViewFilterGroupUniversalIdentifier:
            flatViewFilterGroupToValidate.parentViewFilterGroupUniversalIdentifier,
          flatViewFilterGroupMaps: optimisticFlatViewFilterGroupMaps,
        });

      if (circularDependencyErrors.length > 0) {
        validationResult.errors.push(...circularDependencyErrors);
      }

      const referencedParentInOptimistic = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatViewFilterGroupToValidate.parentViewFilterGroupUniversalIdentifier,
        flatEntityMaps: optimisticFlatViewFilterGroupMaps,
      });

      const referencedParentInRemaining = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatViewFilterGroupToValidate.parentViewFilterGroupUniversalIdentifier,
        flatEntityMaps: remainingFlatEntityMapsToValidate,
      });

      if (
        !isDefined(referencedParentInOptimistic) &&
        !isDefined(referencedParentInRemaining)
      ) {
        validationResult.errors.push({
          code: ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
          message: t`Parent view filter group not found`,
          userFriendlyMessage: msg`Parent view filter group not found`,
        });
      }
    }

    return validationResult;
  }

  validateFlatViewFilterGroupDeletion({
    flatEntityToValidate: flatViewFilterGroupToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFilterGroupMaps: optimisticFlatViewFilterGroupMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFilterGroup
  >): FailedFlatEntityValidation<'viewFilterGroup', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatViewFilterGroupToValidate.universalIdentifier,
      },
      metadataName: 'viewFilterGroup',
      type: 'delete',
    });

    const existingViewFilterGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewFilterGroupToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatViewFilterGroupMaps,
    });

    if (!isDefined(existingViewFilterGroup)) {
      validationResult.errors.push({
        code: ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
        message: t`View filter group not found`,
        userFriendlyMessage: msg`View filter group not found`,
      });
    }

    return validationResult;
  }

  validateFlatViewFilterGroupUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFilterGroupMaps: optimisticFlatViewFilterGroupMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewFilterGroup
  >): FailedFlatEntityValidation<'viewFilterGroup', 'update'> {
    const existingViewFilterGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewFilterGroupMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'viewFilterGroup',
      type: 'update',
    });

    if (!isDefined(existingViewFilterGroup)) {
      validationResult.errors.push({
        code: ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
        message: t`View filter group not found`,
        userFriendlyMessage: msg`View filter group not found`,
      });

      return validationResult;
    }

    const parentViewFilterGroupUniversalIdentifierUpdate =
      flatEntityUpdate.parentViewFilterGroupUniversalIdentifier;

    if (!isDefined(parentViewFilterGroupUniversalIdentifierUpdate)) {
      return validationResult;
    }

    const newParentViewFilterGroupUniversalIdentifier =
      parentViewFilterGroupUniversalIdentifierUpdate;

    const circularDependencyErrors = this.getCircularDependencyValidationErrors(
      {
        viewFilterGroupUniversalIdentifier:
          existingViewFilterGroup.universalIdentifier,
        parentViewFilterGroupUniversalIdentifier:
          newParentViewFilterGroupUniversalIdentifier,
        flatViewFilterGroupMaps: optimisticFlatViewFilterGroupMaps,
      },
    );

    if (circularDependencyErrors.length > 0) {
      validationResult.errors.push(...circularDependencyErrors);
    }

    const referencedParentViewFilterGroup = findFlatEntityByUniversalIdentifier(
      {
        universalIdentifier: newParentViewFilterGroupUniversalIdentifier,
        flatEntityMaps: optimisticFlatViewFilterGroupMaps,
      },
    );

    if (!isDefined(referencedParentViewFilterGroup)) {
      validationResult.errors.push({
        code: ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
        message: t`Parent view filter group not found`,
        userFriendlyMessage: msg`Parent view filter group not found`,
      });
    }

    return validationResult;
  }
}
