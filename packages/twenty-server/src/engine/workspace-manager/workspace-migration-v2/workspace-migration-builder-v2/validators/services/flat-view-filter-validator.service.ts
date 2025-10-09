import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { ViewFilterRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter/types/view-filter-related-flat-entity-maps.type';

@Injectable()
export class FlatViewFilterValidatorService {
  constructor() {}

  validateFlatViewFilterCreation({
    flatViewFilterToValidate,
    dependencyOptimisticFlatEntityMaps,
    optimisticFlatViewFilterMaps,
  }: {
    flatViewFilterToValidate: FlatViewFilter;
    dependencyOptimisticFlatEntityMaps: ViewFilterRelatedFlatEntityMaps;
    optimisticFlatViewFilterMaps: FlatViewFilterMaps;
  }): FailedFlatEntityValidation<FlatViewFilter> {
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
        code: ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
        message: t`View filter with this id already exists`,
        userFriendlyMessage: t`View filter with this id already exists`,
      });
    }

    const referencedView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFilterToValidate.viewId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    if (!isDefined(referencedView)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
        message: t`View not found`,
        userFriendlyMessage: t`View not found`,
      });
    }

    const referencedFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFilterToValidate.fieldMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
    });

    if (!isDefined(referencedFieldMetadata)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
        message: t`Field metadata not found`,
        userFriendlyMessage: t`Field metadata not found`,
      });
    }

    return validationResult;
  }

  validateFlatViewFilterDeletion({
    flatViewFilterToValidate,
    optimisticFlatViewFilterMaps,
  }: {
    flatViewFilterToValidate: FlatViewFilter;
    dependencyOptimisticFlatEntityMaps: ViewFilterRelatedFlatEntityMaps;
    optimisticFlatViewFilterMaps: FlatViewFilterMaps;
  }): FailedFlatEntityValidation<FlatViewFilter> {
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
        userFriendlyMessage: t`View filter not found`,
      });
    } else if (!isDefined(existingViewFilter.deletedAt)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        message: t`View filter has to be soft deleted first`,
        userFriendlyMessage: t`View filter has to be soft deleted first`,
      });
    }

    return validationResult;
  }

  validateFlatViewFilterUpdate({
    flatViewFilterToValidate,
    dependencyOptimisticFlatEntityMaps,
    optimisticFlatViewFilterMaps,
  }: {
    flatViewFilterToValidate: FlatViewFilter;
    dependencyOptimisticFlatEntityMaps: ViewFilterRelatedFlatEntityMaps;
    optimisticFlatViewFilterMaps: FlatViewFilterMaps;
  }): FailedFlatEntityValidation<FlatViewFilter> {
    const validationResult: FailedFlatEntityValidation<FlatViewFilter> = {
      type: 'update_view_filter',
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
        userFriendlyMessage: t`View filter not found`,
      });
    }

    const referencedFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFilterToValidate.fieldMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
    });

    if (!isDefined(referencedFieldMetadata)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
        message: t`Field metadata not found`,
        userFriendlyMessage: t`Field metadata not found`,
      });
    }

    return validationResult;
  }
}
