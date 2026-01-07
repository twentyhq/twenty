import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { ViewFilterGroupExceptionCode } from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/utils/find-flat-entity-property-update.util';
import { validateFlatEntityCircularDependency } from 'src/engine/workspace-manager/workspace-migration-v2/utils/validate-flat-entity-circular-dependency.util';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

// View filter groups can have at most 2 levels of nesting (root and one child level)
const VIEW_FILTER_GROUP_MAX_DEPTH = 2;

@Injectable()
export class FlatViewFilterGroupValidatorService {
  constructor() {}

  private getCircularDependencyValidationErrors({
    viewFilterGroupId,
    parentViewFilterGroupId,
    flatViewFilterGroupMaps,
  }: {
    viewFilterGroupId: string;
    parentViewFilterGroupId: string;
    flatViewFilterGroupMaps: FlatViewFilterGroupMaps;
  }): FlatEntityValidationError<ViewFilterGroupExceptionCode>[] {
    const circularDependencyResult = validateFlatEntityCircularDependency({
      flatEntityId: viewFilterGroupId,
      flatEntityParentId: parentViewFilterGroupId,
      maxDepth: VIEW_FILTER_GROUP_MAX_DEPTH,
      parentIdKey: 'parentViewFilterGroupId',
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
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFilterGroup
  >): FailedFlatEntityValidation<'viewFilterGroup', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatViewFilterGroupToValidate.id,
        universalIdentifier: flatViewFilterGroupToValidate.universalIdentifier,
      },
      metadataName: 'viewFilterGroup',
      type: 'create',
    });

    const existingViewFilterGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFilterGroupToValidate.id,
      flatEntityMaps: optimisticFlatViewFilterGroupMaps,
    });

    if (isDefined(existingViewFilterGroup)) {
      validationResult.errors.push({
        code: ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA,
        message: t`View filter group with this id already exists`,
        userFriendlyMessage: msg`View filter group with this id already exists`,
      });
    }

    const referencedView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFilterGroupToValidate.viewId,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(referencedView)) {
      validationResult.errors.push({
        code: ViewFilterGroupExceptionCode.VIEW_NOT_FOUND,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });
    }

    if (isDefined(flatViewFilterGroupToValidate.parentViewFilterGroupId)) {
      const circularDependencyErrors =
        this.getCircularDependencyValidationErrors({
          viewFilterGroupId: flatViewFilterGroupToValidate.id,
          parentViewFilterGroupId:
            flatViewFilterGroupToValidate.parentViewFilterGroupId,
          flatViewFilterGroupMaps: optimisticFlatViewFilterGroupMaps,
        });

      if (circularDependencyErrors.length > 0) {
        validationResult.errors.push(...circularDependencyErrors);
      }

      const referencedParentInOptimistic = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatViewFilterGroupToValidate.parentViewFilterGroupId,
        flatEntityMaps: optimisticFlatViewFilterGroupMaps,
      });

      const referencedParentInRemaining = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatViewFilterGroupToValidate.parentViewFilterGroupId,
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
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFilterGroup
  >): FailedFlatEntityValidation<'viewFilterGroup', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatViewFilterGroupToValidate.id,
        universalIdentifier: flatViewFilterGroupToValidate.universalIdentifier,
      },
      metadataName: 'viewFilterGroup',
      type: 'delete',
    });

    const existingViewFilterGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFilterGroupToValidate.id,
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
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFilterGroupMaps: optimisticFlatViewFilterGroupMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewFilterGroup
  >): FailedFlatEntityValidation<'viewFilterGroup', 'update'> {
    const existingViewFilterGroup =
      optimisticFlatViewFilterGroupMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingViewFilterGroup?.universalIdentifier,
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
    }

    const parentViewFilterGroupIdUpdate = findFlatEntityPropertyUpdate({
      property: 'parentViewFilterGroupId',
      flatEntityUpdates,
    });

    if (!isDefined(parentViewFilterGroupIdUpdate)) {
      return validationResult;
    }

    const newParentViewFilterGroupId = parentViewFilterGroupIdUpdate.to;

    if (!isDefined(newParentViewFilterGroupId)) {
      return validationResult;
    }

    const circularDependencyErrors = this.getCircularDependencyValidationErrors(
      {
        viewFilterGroupId: flatEntityId,
        parentViewFilterGroupId: newParentViewFilterGroupId,
        flatViewFilterGroupMaps: optimisticFlatViewFilterGroupMaps,
      },
    );

    if (circularDependencyErrors.length > 0) {
      validationResult.errors.push(...circularDependencyErrors);
    }

    const referencedParentViewFilterGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: newParentViewFilterGroupId,
      flatEntityMaps: optimisticFlatViewFilterGroupMaps,
    });

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
