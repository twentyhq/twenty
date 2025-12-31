import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

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
      const referencedParentViewFilterGroup = findFlatEntityByIdInFlatEntityMaps(
        {
          flatEntityId: updatedFlatViewFilterGroup.parentViewFilterGroupId,
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
    }

    return validationResult;
  }
}

