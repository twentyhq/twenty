import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ALL_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-name.constant';
import { FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

@Injectable()
export class FlatViewValidatorService {
  constructor() {}

  public validateFlatViewUpdate({
    flatEntityId,
    optimisticFlatEntityMaps: optimisticFlatViewMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.view
  >): FailedFlatEntityValidation<FlatView> {
    const validationResult: FailedFlatEntityValidation<FlatView> = {
      type: 'update_view',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingFlatView = optimisticFlatViewMaps.byId[flatEntityId];

    if (!isDefined(existingFlatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });
    }

    return validationResult;
  }

  public validateFlatViewDeletion({
    flatEntityToValidate: { id: viewIdToDelete },
    optimisticFlatEntityMaps: optimisticFlatViewMaps,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.view
  >): FailedFlatEntityValidation<FlatView> {
    const validationResult: FailedFlatEntityValidation<FlatView> = {
      type: 'delete_view',
      errors: [],
      flatEntityMinimalInformation: {
        id: viewIdToDelete,
      },
    };

    const existingFlatView = optimisticFlatViewMaps.byId[viewIdToDelete];

    if (!isDefined(existingFlatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });
    } else {
      if (!isDefined(existingFlatView.deletedAt)) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`View to delete has not been soft deleted`,
          userFriendlyMessage: msg`View to delete has not been soft deleted`,
        });
      }
    }

    return validationResult;
  }

  public async validateFlatViewCreation({
    flatEntityToValidate: flatViewToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.view>): Promise<
    FailedFlatEntityValidation<FlatView>
  > {
    const validationResult: FailedFlatEntityValidation<FlatView> = {
      type: 'create_view',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatViewToValidate.id,
      },
    };

    const optimisticFlatObjectMetadata =
      dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps.byId[
        flatViewToValidate.objectMetadataId
      ];

    if (!isDefined(optimisticFlatObjectMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    if (isDefined(optimisticFlatViewMaps.byId[flatViewToValidate.id])) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View with same id is already exists`,
        userFriendlyMessage: msg`View already exists`,
      });
    }

    return validationResult;
  }
}
