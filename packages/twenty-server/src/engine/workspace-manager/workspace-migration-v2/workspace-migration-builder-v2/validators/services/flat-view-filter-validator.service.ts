import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatViewFilterValidatorService {
  constructor() {}

  validateFlatViewFilterCreation({
    flatEntityToValidate: flatViewFilterToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFilterMaps: optimisticFlatViewFilterMaps,
      flatViewMaps,
      flatFieldMetadataMaps,
      flatViewFilterGroupMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFilter
  >): FailedFlatEntityValidation<'viewFilter', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatViewFilterToValidate.id,
        universalIdentifier: flatViewFilterToValidate.universalIdentifier,
      },
      metadataName: 'viewFilter',
      type: 'create',
    });

    const existingViewFilter = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFilterToValidate.id,
      flatEntityMaps: optimisticFlatViewFilterMaps,
    });

    if (isDefined(existingViewFilter)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        message: t`View filter with this id already exists`,
        userFriendlyMessage: msg`View filter with this id already exists`,
      });
    }

    const referencedView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFilterToValidate.viewId,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(referencedView)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });
    }

    const referencedFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFilterToValidate.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(referencedFieldMetadata)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    if (isDefined(flatViewFilterToValidate.viewFilterGroupId)) {
      const referencedViewFilterGroup = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatViewFilterToValidate.viewFilterGroupId,
        flatEntityMaps: flatViewFilterGroupMaps,
      });

      if (!isDefined(referencedViewFilterGroup)) {
        validationResult.errors.push({
          code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
          message: t`View filter group not found`,
          userFriendlyMessage: msg`View filter group not found`,
        });
      }
    }

    return validationResult;
  }

  validateFlatViewFilterDeletion({
    flatEntityToValidate: flatViewFilterToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFilterMaps: optimisticFlatViewFilterMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFilter
  >): FailedFlatEntityValidation<'viewFilter', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatViewFilterToValidate.id,
        universalIdentifier: flatViewFilterToValidate.universalIdentifier,
      },
      metadataName: 'viewFilter',
      type: 'delete',
    });

    const existingViewFilter = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFilterToValidate.id,
      flatEntityMaps: optimisticFlatViewFilterMaps,
    });

    if (!isDefined(existingViewFilter)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
        message: t`View filter not found`,
        userFriendlyMessage: msg`View filter not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  validateFlatViewFilterUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFilterMaps: optimisticFlatViewFilterMaps,
      flatFieldMetadataMaps,
      flatViewFilterGroupMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewFilter
  >): FailedFlatEntityValidation<'viewFilter', 'update'> {
    const existingViewFilter = optimisticFlatViewFilterMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingViewFilter?.universalIdentifier,
      },
      metadataName: 'viewFilter',
      type: 'update',
    });

    if (!isDefined(existingViewFilter)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
        message: t`View filter not found`,
        userFriendlyMessage: msg`View filter not found`,
      });

      return validationResult;
    }

    const updatedFlatViewFilter = {
      ...existingViewFilter,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    const referencedFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updatedFlatViewFilter.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(referencedFieldMetadata)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    if (isDefined(updatedFlatViewFilter.viewFilterGroupId)) {
      const referencedViewFilterGroup = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: updatedFlatViewFilter.viewFilterGroupId,
        flatEntityMaps: flatViewFilterGroupMaps,
      });

      if (!isDefined(referencedViewFilterGroup)) {
        validationResult.errors.push({
          code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
          message: t`View filter group not found`,
          userFriendlyMessage: msg`View filter group not found`,
        });
      }
    }

    return validationResult;
  }
}
