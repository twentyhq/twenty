import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { ViewFilterGroupExceptionCode } from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatViewFilterGroupValidatorService {
  constructor() {}

  private hasCircularDependency({
    viewFilterGroupId,
    parentViewFilterGroupId,
    flatViewFilterGroupMaps,
  }: {
    viewFilterGroupId: string;
    parentViewFilterGroupId: string;
    flatViewFilterGroupMaps: FlatEntityMaps<FlatViewFilterGroup>;
  }): boolean {
    // Direct self-reference check
    if (viewFilterGroupId === parentViewFilterGroupId) {
      return true;
    }

    // Traverse ancestor chain to detect cycles
    const visited = new Set<string>();
    let currentParentId: string | null = parentViewFilterGroupId;

    while (currentParentId !== null) {
      if (currentParentId === viewFilterGroupId) {
        return true;
      }

      if (visited.has(currentParentId)) {
        // Already visited this node, cycle detected in ancestors
        return true;
      }

      visited.add(currentParentId);

      const parentGroup: FlatViewFilterGroup | undefined =
        flatViewFilterGroupMaps.byId[currentParentId];

      if (!isDefined(parentGroup)) {
        break;
      }

      currentParentId = parentGroup.parentViewFilterGroupId ?? null;
    }

    return false;
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
  >): FailedFlatEntityValidation<FlatViewFilterGroup> {
    const validationResult: FailedFlatEntityValidation<FlatViewFilterGroup> = {
      type: 'create_view_filter_group',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatViewFilterGroupToValidate.id,
      },
    };

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
      // Check for self-reference (a group cannot be its own parent)
      if (
        flatViewFilterGroupToValidate.id ===
        flatViewFilterGroupToValidate.parentViewFilterGroupId
      ) {
        validationResult.errors.push({
          code: ViewFilterGroupExceptionCode.CIRCULAR_DEPENDENCY,
          message: t`View filter group cannot be its own parent`,
          userFriendlyMessage: msg`View filter group cannot be its own parent`,
        });

        return validationResult;
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
  >): FailedFlatEntityValidation<FlatViewFilterGroup> {
    const validationResult: FailedFlatEntityValidation<FlatViewFilterGroup> = {
      type: 'delete_view_filter_group',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatViewFilterGroupToValidate.id,
      },
    };

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

      return validationResult;
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
  >): FailedFlatEntityValidation<FlatViewFilterGroup> {
    const validationResult: FailedFlatEntityValidation<FlatViewFilterGroup> = {
      type: 'update_view_filter_group',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingViewFilterGroup =
      optimisticFlatViewFilterGroupMaps.byId[flatEntityId];

    if (!isDefined(existingViewFilterGroup)) {
      validationResult.errors.push({
        code: ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
        message: t`View filter group not found`,
        userFriendlyMessage: msg`View filter group not found`,
      });

      return validationResult;
    }

    const updatedFlatViewFilterGroup = {
      ...existingViewFilterGroup,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    if (isDefined(updatedFlatViewFilterGroup.parentViewFilterGroupId)) {
      // Check for circular dependency (including self-reference)
      if (
        this.hasCircularDependency({
          viewFilterGroupId: flatEntityId,
          parentViewFilterGroupId:
            updatedFlatViewFilterGroup.parentViewFilterGroupId,
          flatViewFilterGroupMaps: optimisticFlatViewFilterGroupMaps,
        })
      ) {
        validationResult.errors.push({
          code: ViewFilterGroupExceptionCode.CIRCULAR_DEPENDENCY,
          message: t`Circular dependency detected in view filter group hierarchy`,
          userFriendlyMessage: msg`Circular dependency detected in view filter group hierarchy`,
        });

        return validationResult;
      }

      const referencedParentViewFilterGroup =
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: updatedFlatViewFilterGroup.parentViewFilterGroupId,
          flatEntityMaps: optimisticFlatViewFilterGroupMaps,
        });

      if (!isDefined(referencedParentViewFilterGroup)) {
        validationResult.errors.push({
          code: ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
          message: t`Parent view filter group not found`,
          userFriendlyMessage: msg`Parent view filter group not found`,
        });
      }
    }

    return validationResult;
  }
}
