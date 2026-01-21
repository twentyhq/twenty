import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { ViewSortExceptionCode } from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatViewSortValidatorService {
  constructor() {}

  public validateFlatViewSortUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewSortMaps: optimisticFlatViewSortMaps,
      flatViewMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewSort
  >): FailedFlatEntityValidation<'viewSort', 'update'> {
    const existingFlatViewSort = optimisticFlatViewSortMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingFlatViewSort?.universalIdentifier,
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
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      id: updatedFlatViewSort.id,
      viewId: updatedFlatViewSort.viewId,
      fieldMetadataId: updatedFlatViewSort.fieldMetadataId,
    };

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updatedFlatViewSort.viewId,
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
    flatEntityToValidate: { id: viewSortIdToDelete, universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewSortMaps: optimisticFlatViewSortMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewSort
  >): FailedFlatEntityValidation<'viewSort', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: viewSortIdToDelete,
        universalIdentifier,
      },
      metadataName: 'viewSort',
      type: 'delete',
    });

    const existingFlatViewSort =
      optimisticFlatViewSortMaps.byId[viewSortIdToDelete];

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

  public validateFlatViewSortCreation({
    flatEntityToValidate: flatViewSortToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewSortMaps: optimisticFlatViewSortMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewSort
  >): FailedFlatEntityValidation<'viewSort', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatViewSortToValidate.id,
        universalIdentifier: flatViewSortToValidate.universalIdentifier,
        viewId: flatViewSortToValidate.viewId,
        fieldMetadataId: flatViewSortToValidate.fieldMetadataId,
      },
      metadataName: 'viewSort',
      type: 'create',
    });

    const existingFlatViewSort =
      optimisticFlatViewSortMaps.byId[flatViewSortToValidate.id];

    if (isDefined(existingFlatViewSort)) {
      const flatViewSortId = flatViewSortToValidate.id;

      validationResult.errors.push({
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        message: t`View sort with id ${flatViewSortId} already exists`,
        userFriendlyMessage: msg`View sort already exists`,
      });
    }

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewSortToValidate.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      validationResult.errors.push({
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    const flatView = flatViewMaps.byId[flatViewSortToValidate.viewId];

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewSortExceptionCode.VIEW_NOT_FOUND,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });

      return validationResult;
    }

    const otherFlatViewSorts = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatView.viewSortIds,
      flatEntityMaps: optimisticFlatViewSortMaps,
    });

    const equivalentExistingFlatViewSortExists = otherFlatViewSorts.some(
      (flatViewSort) =>
        flatViewSort.viewId === flatViewSortToValidate.viewId &&
        flatViewSort.fieldMetadataId ===
          flatViewSortToValidate.fieldMetadataId,
    );

    if (equivalentExistingFlatViewSortExists) {
      validationResult.errors.push({
        code: ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
        message: t`View sort with same fieldMetadataId and viewId already exists`,
        userFriendlyMessage: msg`View sort already exists`,
      });
    }

    return validationResult;
  }
}
