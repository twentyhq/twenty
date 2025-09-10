import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ViewExceptionCode } from 'src/engine/core-modules/view/exceptions/view.exception';
import { FailedFlatViewFieldValidation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-field-validation.type';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-with-field-id-only.util';

@Injectable()
export class FlatViewFieldValidatorService {
  constructor() {}

  public validateFlatViewFieldUpdate({
    existingFlatViewFieldMaps,
    updatedFlatViewField,
    optimisticFlatViewMaps,
  }: {
    existingFlatViewFieldMaps: FlatViewFieldMaps;
    updatedFlatViewField: FlatViewField;
    optimisticFlatViewMaps: FlatViewMaps;
  }): FailedFlatViewFieldValidation {
    const errors = [];

    const optimisticFlatView =
      optimisticFlatViewMaps.byId[updatedFlatViewField.viewId];

    if (!isDefined(optimisticFlatView)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: t`View not found`,
      });
    }

    const existingFlatViewField =
      existingFlatViewFieldMaps.byId[updatedFlatViewField.id];

    if (!isDefined(existingFlatViewField)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field not found`,
        userFriendlyMessage: t`View field not found`,
      });
    }

    return {
      type: 'update_view_field',
      viewFieldLevelErrors: errors,
      failedViewFieldValidationMinimalInformation: {
        id: updatedFlatViewField.id,
        viewId: updatedFlatViewField.viewId,
        fieldMetadataId: updatedFlatViewField.fieldMetadataId,
      },
    };
  }

  public validateFlatViewFieldDeletion({
    existingFlatViewFieldMaps,
    viewFieldIdToDelete,
    optimisticFlatViewMaps,
  }: {
    existingFlatViewFieldMaps: FlatViewFieldMaps;
    viewFieldIdToDelete: string;
    optimisticFlatViewMaps: FlatViewMaps;
  }): FailedFlatViewFieldValidation {
    const errors = [];

    const optimisticFlatView = optimisticFlatViewMaps.byId[viewFieldIdToDelete];

    if (!isDefined(optimisticFlatView)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: t`View not found`,
      });
    }

    const existingFlatViewField =
      existingFlatViewFieldMaps.byId[viewFieldIdToDelete];

    if (!isDefined(existingFlatViewField)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field not found`,
        userFriendlyMessage: t`View field not found`,
      });
    }

    return {
      type: 'delete_view_field',
      viewFieldLevelErrors: errors,
      failedViewFieldValidationMinimalInformation: {
        id: viewFieldIdToDelete,
      },
    };
  }

  public async validateFlatViewFieldCreation({
    _existingFlatViewFieldMaps,
    flatViewFieldToValidate,
    optimisticFlatObjectMetadataMaps,
    optimisticFlatViewMaps,
  }: {
    _existingFlatViewFieldMaps: FlatViewFieldMaps;
    flatViewFieldToValidate: FlatViewField;
    optimisticFlatObjectMetadataMaps: FlatObjectMetadataMaps;
    optimisticFlatViewMaps: FlatViewMaps;
  }): Promise<FailedFlatViewFieldValidation> {
    const errors = [];

    const relatedFlatFieldMetadata =
      findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId({
        fieldMetadataId: flatViewFieldToValidate.fieldMetadataId,
        flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
      });

    if (!isDefined(relatedFlatFieldMetadata)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: t`Field metadata not found`,
      });
    }

    const optimisticFlatView =
      optimisticFlatViewMaps.byId[flatViewFieldToValidate.viewId];

    if (!isDefined(optimisticFlatView)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: t`View not found`,
      });
    }

    return {
      type: 'create_view_field',
      viewFieldLevelErrors: errors,
      failedViewFieldValidationMinimalInformation: {
        id: flatViewFieldToValidate.id,
        viewId: flatViewFieldToValidate.viewId,
        fieldMetadataId: flatViewFieldToValidate.fieldMetadataId,
      },
    };
  }
}
