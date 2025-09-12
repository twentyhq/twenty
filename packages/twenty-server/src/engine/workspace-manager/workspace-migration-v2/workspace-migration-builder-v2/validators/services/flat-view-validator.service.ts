import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ViewExceptionCode } from 'src/engine/core-modules/view/exceptions/view.exception';
import { FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { ViewRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';

type ViewValidationArgs = {
  flatViewToValidate: FlatView;
  optimisticFlatViewMaps: FlatViewMaps;
  dependencyOptimisticFlatEntityMaps: ViewRelatedFlatEntityMaps;
};
@Injectable()
export class FlatViewValidatorService {
  constructor() {}

  public validateFlatViewUpdate({
    flatViewToValidate: updatedFlatView,
    optimisticFlatViewMaps,
  }: ViewValidationArgs): FailedFlatEntityValidation<FlatView> {
    const errors = [];

    const existingFlatView = optimisticFlatViewMaps.byId[updatedFlatView.id];

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
    flatViewToValidate: { id: viewIdToDelete },
    optimisticFlatViewMaps,
  }: ViewValidationArgs): FailedFlatEntityValidation<FlatView> {
    const errors = [];

    const existingFlatView = optimisticFlatViewMaps.byId[viewIdToDelete];

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
    dependencyOptimisticFlatEntityMaps: { flatObjectMetadataMaps },
    flatViewToValidate,
    optimisticFlatViewMaps,
  }: ViewValidationArgs): Promise<FailedFlatEntityValidation<FlatView>> {
    const optimisticFlatObjectMetadata =
      flatObjectMetadataMaps.byId[flatViewToValidate.objectMetadataId];

    const errors = [];

    if (!isDefined(optimisticFlatObjectMetadata)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Object metadata not found`,
        userFriendlyMessage: t`Object metadata not found`,
      });
    }

    if (isDefined(optimisticFlatViewMaps.byId[flatViewToValidate.id])) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View with same is already exists`,
        userFriendlyMessage: t`View already exists`,
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
