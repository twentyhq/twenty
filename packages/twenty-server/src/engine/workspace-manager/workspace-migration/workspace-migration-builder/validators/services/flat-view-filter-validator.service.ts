import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

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
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFilter
  >): FailedFlatEntityValidation<'viewFilter', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatViewFilterToValidate.universalIdentifier,
      },
      metadataName: 'viewFilter',
      type: 'create',
    });

    const existingViewFilter = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewFilterToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatViewFilterMaps,
    });

    if (isDefined(existingViewFilter)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        message: t`View filter with this universal identifier already exists`,
        userFriendlyMessage: msg`View filter already exists`,
      });
    }

    const referencedView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewFilterToValidate.viewUniversalIdentifier,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(referencedView)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });
    }

    const referencedFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatViewFilterToValidate.fieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(referencedFieldMetadata)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    if (
      isDefined(flatViewFilterToValidate.viewFilterGroupUniversalIdentifier)
    ) {
      const referencedViewFilterGroup = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatViewFilterToValidate.viewFilterGroupUniversalIdentifier,
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
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFilter
  >): FailedFlatEntityValidation<'viewFilter', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatViewFilterToValidate.universalIdentifier,
      },
      metadataName: 'viewFilter',
      type: 'delete',
    });

    const existingViewFilter = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewFilterToValidate.universalIdentifier,
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
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFilterMaps: optimisticFlatViewFilterMaps,
      flatFieldMetadataMaps,
      flatViewFilterGroupMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewFilter
  >): FailedFlatEntityValidation<'viewFilter', 'update'> {
    const existingViewFilter = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewFilterMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
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
      ...flatEntityUpdate,
    };

    const referencedFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        updatedFlatViewFilter.fieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(referencedFieldMetadata)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    if (isDefined(updatedFlatViewFilter.viewFilterGroupUniversalIdentifier)) {
      const referencedViewFilterGroup = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          updatedFlatViewFilter.viewFilterGroupUniversalIdentifier,
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
