import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ViewExceptionCode } from 'src/engine/core-modules/view/exceptions/view.exception';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { ViewFieldRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/types/view-field-related-flat-entity-maps.type';

type ViewFieldValidationArgs = {
  flatViewFieldToValidate: FlatViewField;
  optimisticFlatViewFieldMaps: FlatViewFieldMaps;
  dependencyOptimisticFlatEntityMaps: ViewFieldRelatedFlatEntityMaps;
};
@Injectable()
export class FlatViewFieldValidatorService {
  constructor() {}

  // Should implement strict checking on field compared field and their integrity passing the update array would be the best
  public validateFlatViewFieldUpdate({
    flatViewFieldToValidate: updatedFlatViewField,
    optimisticFlatViewFieldMaps,
  }: ViewFieldValidationArgs): FailedFlatEntityValidation<FlatViewField> {
    const errors = [];

    const existingFlatViewField =
      optimisticFlatViewFieldMaps.byId[updatedFlatViewField.id];

    if (!isDefined(existingFlatViewField)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field to update not found`,
        userFriendlyMessage: t`View field to update not found`,
      });
    }

    return {
      type: 'update_view_field',
      errors,
      flatEntityMinimalInformation: {
        id: updatedFlatViewField.id,
        viewId: updatedFlatViewField.viewId,
        fieldMetadataId: updatedFlatViewField.fieldMetadataId,
      },
    };
  }

  public validateFlatViewFieldDeletion({
    optimisticFlatViewFieldMaps,
    flatViewFieldToValidate: { id: viewFieldIdToDelete },
  }: ViewFieldValidationArgs): FailedFlatEntityValidation<FlatViewField> {
    const errors = [];

    const existingFlatViewField =
      optimisticFlatViewFieldMaps.byId[viewFieldIdToDelete];

    if (!isDefined(existingFlatViewField)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field to delete not found`,
        userFriendlyMessage: t`View field to delete not found`,
      });
    } else {
      if (!isDefined(existingFlatViewField.deletedAt)) {
        errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`View field to delete has not been soft deleted`,
          userFriendlyMessage: t`View field to delete has not been soft deleted`,
        });
      }
    }

    return {
      type: 'delete_view_field',
      errors,
      flatEntityMinimalInformation: {
        id: viewFieldIdToDelete,
      },
    };
  }

  public async validateFlatViewFieldCreation({
    flatViewFieldToValidate,
    optimisticFlatViewFieldMaps,
    dependencyOptimisticFlatEntityMaps: {
      flatViewMaps: optimisticFlatViewMaps,
      flatFieldMetadataMaps,
    },
  }: {
    flatViewFieldToValidate: FlatViewField;
    optimisticFlatViewFieldMaps: FlatViewFieldMaps;
    dependencyOptimisticFlatEntityMaps: ViewFieldRelatedFlatEntityMaps;
  }): Promise<FailedFlatEntityValidation<FlatViewField>> {
    const errors = [];

    const existingFlatViewField =
      optimisticFlatViewFieldMaps.byId[flatViewFieldToValidate.id];

    if (isDefined(existingFlatViewField)) {
      const flatViewFieldId = flatViewFieldToValidate.id;

      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field metadata with id ${flatViewFieldId} already exists`,
        userFriendlyMessage: t`View field metadata already exists`,
      });
    }

    const relatedFlatView =
      optimisticFlatViewMaps.byId[flatViewFieldToValidate.viewId];

    if (!isDefined(relatedFlatView)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: t`View not found`,
      });
    }

    const relatedFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFieldToValidate.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(relatedFlatFieldMetadata)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: t`Field metadata not found`,
      });
    }

    const allFlatViewFields = Object.values(
      optimisticFlatViewFieldMaps.byId,
    ).filter(isDefined);
    const matchingFlatView = allFlatViewFields.find(
      (flatViewField) =>
        flatViewField.viewId === flatViewFieldToValidate.viewId &&
        flatViewField.fieldMetadataId ===
          flatViewFieldToValidate.fieldMetadataId,
    );

    if (isDefined(matchingFlatView)) {
      errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field with same fieldmetadataId and viewId already exists`,
        userFriendlyMessage: t`View field already exists`,
      });
    }

    return {
      type: 'create_view_field',
      errors,
      flatEntityMinimalInformation: {
        id: flatViewFieldToValidate.id,
        viewId: flatViewFieldToValidate.viewId,
        fieldMetadataId: flatViewFieldToValidate.fieldMetadataId,
      },
    };
  }
}
