import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ViewExceptionCode } from 'src/engine/core-modules/view/exceptions/view.exception';
import { FailedFlatViewValidation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-validation.type';
import { FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

@Injectable()
export class FlatViewValidatorService {
  constructor() {}

  public validateFlatViewUpdate({
    existingFlatViewMaps,
    updatedFlatView,
  }: {
    existingFlatViewMaps: FlatViewMaps;
    updatedFlatView: FlatView;
  }): FailedFlatViewValidation {
    const errors = [];

    const existingFlatView = existingFlatViewMaps.byId[updatedFlatView.id];

    if (!isDefined(existingFlatView)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: t`View not found`,
      });
    }

    return {
      type: 'update_view',
      viewLevelErrors: errors,
      failedViewValidationMinimalInformation: {
        id: updatedFlatView.id,
      },
    };
  }

  public validateFlatViewDeletion({
    existingFlatViewMaps,
    viewIdToDelete,
  }: {
    existingFlatViewMaps: FlatViewMaps;
    viewIdToDelete: string;
  }): FailedFlatViewValidation {
    const errors = [];

    const existingFlatView = existingFlatViewMaps.byId[viewIdToDelete];

    if (!isDefined(existingFlatView)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: t`View not found`,
      });
    }

    return {
      type: 'delete_view',
      viewLevelErrors: errors,
      failedViewValidationMinimalInformation: {
        id: viewIdToDelete,
      },
    };
  }

  public async validateFlatViewCreation({
    _existingFlatViewMaps,
    flatViewToValidate,
    optimisticFlatObjectMetadataMaps,
  }: {
    _existingFlatViewMaps: FlatViewMaps;
    flatViewToValidate: FlatView;
    optimisticFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  }): Promise<FailedFlatViewValidation> {
    const optimisticFlatObjectMetadata =
      optimisticFlatObjectMetadataMaps.byId[
        flatViewToValidate.objectMetadataId
      ];

    const errors = [];

    if (!isDefined(optimisticFlatObjectMetadata)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Object metadata not found`,
        userFriendlyMessage: t`Object metadata not found`,
      });
    }

    return {
      type: 'create_view',
      viewLevelErrors: errors,
      failedViewValidationMinimalInformation: {
        id: flatViewToValidate.id,
      },
    };
  }
}
