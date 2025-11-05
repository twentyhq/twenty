import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
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
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFilter
  >): FailedFlatEntityValidation<FlatViewFilter> {
    const validationResult: FailedFlatEntityValidation<FlatViewFilter> = {
      type: 'create_view_filter',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatViewFilterToValidate.id,
      },
    };

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

    return validationResult;
  }

  validateFlatViewFilterDeletion({
    flatEntityToValidate: flatViewFilterToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFilterMaps: optimisticFlatViewFilterMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFilter
  >): FailedFlatEntityValidation<FlatViewFilter> {
    const validationResult: FailedFlatEntityValidation<FlatViewFilter> = {
      type: 'delete_view_filter',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatViewFilterToValidate.id,
      },
    };

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
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewFilter
  >): FailedFlatEntityValidation<FlatViewFilter> {
    const validationResult: FailedFlatEntityValidation<FlatViewFilter> = {
      type: 'update_view_filter',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingViewFilter = optimisticFlatViewFilterMaps.byId[flatEntityId];

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

    return validationResult;
  }
}
