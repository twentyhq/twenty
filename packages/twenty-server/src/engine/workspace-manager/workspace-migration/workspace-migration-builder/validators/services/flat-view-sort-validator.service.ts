import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewSortExceptionCode } from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';

@Injectable()
export class FlatViewSortValidatorService {
  constructor() {}

  validateFlatViewSortCreation({
    flatEntityToValidate: flatViewSortToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewSortMaps: optimisticFlatViewSortMaps,
      flatViewMaps,
      flatFieldMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewSort
  >): FailedFlatEntityValidation<'viewSort', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatViewSortToValidate.universalIdentifier,
        viewUniversalIdentifier: flatViewSortToValidate.viewUniversalIdentifier,
      },
      metadataName: 'viewSort',
      type: 'create',
    });

    const existingFlatViewSort = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewSortToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatViewSortMaps,
    });

    if (isDefined(existingFlatViewSort)) {
      const flatViewSortId = flatViewSortToValidate.universalIdentifier;

      validationResult.errors.push({
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        message: t`View sort with id ${flatViewSortId} already exists`,
        userFriendlyMessage: msg`View sort already exists`,
      });
    }

    const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatViewSortToValidate.fieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      validationResult.errors.push({
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    const flatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewSortToValidate.viewUniversalIdentifier,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewSortExceptionCode.VIEW_NOT_FOUND,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });

      return validationResult;
    }

    const otherFlatViewSorts =
      findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow({
        universalIdentifiers: flatView.viewSortUniversalIdentifiers,
        flatEntityMaps: optimisticFlatViewSortMaps,
      });

    const equivalentExistingFlatViewSortExists = otherFlatViewSorts.some(
      (flatViewSort) =>
        flatViewSort.universalIdentifier ===
          flatViewSortToValidate.universalIdentifier &&
        flatViewSort.fieldMetadataUniversalIdentifier ===
          flatViewSortToValidate.fieldMetadataUniversalIdentifier,
    );

    if (equivalentExistingFlatViewSortExists) {
      validationResult.errors.push({
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        message: t`View sort with same fieldMetadataId and viewId already exists`,
        userFriendlyMessage: msg`View sort already exists`,
      });
    }

    if (
      !isDefined(flatViewSortToValidate.direction) ||
      !Object.values(ViewSortDirection).includes(
        flatViewSortToValidate.direction,
      )
    ) {
      validationResult.errors.push({
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        message: t`View sort with invalid direction`,
        userFriendlyMessage: msg`View sort with invalid direction, should be ASC or DESC`,
      });
    }

    return validationResult;
  }

  public validateFlatViewSortUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewSortMaps: optimisticFlatViewSortMaps,
      flatViewMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewSort
  >): FailedFlatEntityValidation<'viewSort', 'update'> {
    const existingFlatViewSort = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewSortMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'viewSort',
      type: 'update',
    });

    if (!isDefined(existingFlatViewSort)) {
      validationResult.errors.push({
        code: ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
        message: t`View sort to update not found`,
        userFriendlyMessage: msg`View sort to update not found`,
      });

      return validationResult;
    }

    const updatedFlatViewSort = {
      ...existingFlatViewSort,
      ...flatEntityUpdate,
    };

    if (
      !isDefined(updatedFlatViewSort?.direction) ||
      !(
        updatedFlatViewSort.direction === ViewSortDirection.DESC ||
        updatedFlatViewSort.direction === ViewSortDirection.ASC
      )
    ) {
      validationResult.errors.push({
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        message: t`Correct direction is required`,
        userFriendlyMessage: msg`Correct direction is required`,
      });
    }

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      viewUniversalIdentifier: updatedFlatViewSort.viewUniversalIdentifier,
    };

    const flatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: updatedFlatViewSort.viewUniversalIdentifier,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewSortExceptionCode.VIEW_NOT_FOUND,
        message: t`View sort to update parent view not found`,
        userFriendlyMessage: msg`View sort to update parent view not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public validateFlatViewSortDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewSortMaps: optimisticFlatViewSortMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewSort
  >): FailedFlatEntityValidation<'viewSort', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'viewSort',
      type: 'delete',
    });

    const existingFlatViewSort = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewSortMaps,
    });

    if (!isDefined(existingFlatViewSort)) {
      validationResult.errors.push({
        code: ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
        message: t`View sort to delete not found`,
        userFriendlyMessage: msg`View sort to delete not found`,
      });

      return validationResult;
    }

    return validationResult;
  }
}
