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
    _existingFlatViewMaps,
    updatedFlatView,
  }: {
    _existingFlatViewMaps: FlatViewMaps;
    updatedFlatView: FlatView;
  }): FailedFlatViewValidation {
    return {
      type: 'update_view',
      viewLevelErrors: [],
      failedViewValidationMinimalInformation: {
        id: updatedFlatView.id,
      },
    };
  }

  public validateFlatViewDeletion({
    _existingFlatViewMaps,
    viewIdToDelete,
  }: {
    _existingFlatViewMaps: FlatViewMaps;
    viewIdToDelete: string;
  }): FailedFlatViewValidation {
    return {
      type: 'delete_view',
      viewLevelErrors: [],
      failedViewValidationMinimalInformation: {
        id: viewIdToDelete,
      },
    };
  }

  public async validateFlatViewCreation({
    _existingFlatViewMaps,
    flatViewToValidate,
    _otherFlatViewMapsToValidate,
    optimisticFlatObjectMetadataMaps,
  }: {
    _existingFlatViewMaps: FlatViewMaps;
    flatViewToValidate: FlatView;
    _otherFlatViewMapsToValidate?: FlatViewMaps;
    optimisticFlatObjectMetadataMaps?: FlatObjectMetadataMaps; // TODO: Fix this, should always be defined
  }): Promise<FailedFlatViewValidation> {
    if (!isDefined(optimisticFlatObjectMetadataMaps)) {
      throw new Error('Optimistic flat object metadata maps is not defined');
    }

    const optimisticFlatObjectMetadata =
      optimisticFlatObjectMetadataMaps.byId[
        flatViewToValidate.objectMetadataId
      ];

    if (!isDefined(optimisticFlatObjectMetadata)) {
      return {
        type: 'create_view',
        viewLevelErrors: [
          {
            code: ViewExceptionCode.INVALID_VIEW_DATA,
            message: t`Object metadata not found`,
            userFriendlyMessage: t`Object metadata not found`,
          },
        ],
        failedViewValidationMinimalInformation: {
          id: flatViewToValidate.id,
        },
      };
    }

    return {
      type: 'create_view',
      viewLevelErrors: [],
      failedViewValidationMinimalInformation: {
        id: flatViewToValidate.id,
      },
    };
  }
}
