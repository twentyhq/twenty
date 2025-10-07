import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { ViewExceptionCode } from 'src/engine/core-modules/view/exceptions/view.exception';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { ViewFieldRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/types/view-field-related-flat-entity-maps.type';
import { validateLabelIdentifierFieldMetadataIdFlatViewField } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-label-identifier-field-metadata-id-flat-view-field.util';

type ViewFieldValidationArgs = {
  flatViewFieldToValidate: FlatViewField;
  optimisticFlatViewFieldMaps: FlatViewFieldMaps;
  dependencyOptimisticFlatEntityMaps: ViewFieldRelatedFlatEntityMaps;
};
@Injectable()
export class FlatViewFieldValidatorService {
  constructor() {}

  public validateFlatViewFieldUpdate({
    flatViewFieldToValidate: updatedFlatViewField,
    optimisticFlatViewFieldMaps,
    dependencyOptimisticFlatEntityMaps: {
      flatViewMaps,
      flatObjectMetadataMaps,
    },
  }: ViewFieldValidationArgs): FailedFlatEntityValidation<FlatViewField> {
    const validationResult: FailedFlatEntityValidation<FlatViewField> = {
      type: 'update_view_field',
      errors: [],
      flatEntityMinimalInformation: {
        id: updatedFlatViewField.id,
      },
    };

    const existingFlatViewField =
      optimisticFlatViewFieldMaps.byId[updatedFlatViewField.id];

    if (!isDefined(existingFlatViewField)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field to update not found`,
        userFriendlyMessage: t`View field to update not found`,
      });

      return validationResult;
    }

    validationResult.flatEntityMinimalInformation = {
      id: updatedFlatViewField.id,
      viewId: updatedFlatViewField.viewId,
      fieldMetadataId: updatedFlatViewField.fieldMetadataId,
    };

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updatedFlatViewField.viewId,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field to update parent view not found`,
        userFriendlyMessage: t`View field to update parent view not found`,
      });

      return validationResult;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatView.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field to update parent view object not found`,
        userFriendlyMessage: t`View field to update parent view object not found`,
      });

      return validationResult;
    }

    if (
      flatObjectMetadata.labelIdentifierFieldMetadataId ===
      updatedFlatViewField.fieldMetadataId
    ) {
      const otherFlatViewFields = findManyFlatEntityByIdInFlatEntityMapsOrThrow(
        {
          flatEntityIds: flatView.viewFieldIds,
          flatEntityMaps: optimisticFlatViewFieldMaps,
        },
      );

      validationResult.errors.push(
        ...validateLabelIdentifierFieldMetadataIdFlatViewField({
          otherFlatViewFields,
          flatViewFieldToValidate: updatedFlatViewField,
        }),
      );
    }

    return validationResult;
  }

  public validateFlatViewFieldDeletion({
    optimisticFlatViewFieldMaps,
    flatViewFieldToValidate: { id: viewFieldIdToDelete },
  }: ViewFieldValidationArgs): FailedFlatEntityValidation<FlatViewField> {
    const validationResult: FailedFlatEntityValidation<FlatViewField> = {
      type: 'delete_view_field',
      errors: [],
      flatEntityMinimalInformation: {
        id: viewFieldIdToDelete,
      },
    };

    const existingFlatViewField =
      optimisticFlatViewFieldMaps.byId[viewFieldIdToDelete];

    if (!isDefined(existingFlatViewField)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field to delete not found`,
        userFriendlyMessage: t`View field to delete not found`,
      });
    } else {
      if (!isDefined(existingFlatViewField.deletedAt)) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`View field to delete has not been soft deleted`,
          userFriendlyMessage: t`View field to delete has not been soft deleted`,
        });
      }
    }

    return validationResult;
  }

  public async validateFlatViewFieldCreation({
    flatViewFieldToValidate,
    optimisticFlatViewFieldMaps,
    dependencyOptimisticFlatEntityMaps: {
      flatViewMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
  }: {
    flatViewFieldToValidate: FlatViewField;
    optimisticFlatViewFieldMaps: FlatViewFieldMaps;
    dependencyOptimisticFlatEntityMaps: ViewFieldRelatedFlatEntityMaps;
  }): Promise<FailedFlatEntityValidation<FlatViewField>> {
    const validationResult: FailedFlatEntityValidation<FlatViewField> = {
      type: 'create_view_field',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatViewFieldToValidate.id,
        viewId: flatViewFieldToValidate.viewId,
        fieldMetadataId: flatViewFieldToValidate.fieldMetadataId,
      },
    };

    const existingFlatViewField =
      optimisticFlatViewFieldMaps.byId[flatViewFieldToValidate.id];

    if (isDefined(existingFlatViewField)) {
      const flatViewFieldId = flatViewFieldToValidate.id;

      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field metadata with id ${flatViewFieldId} already exists`,
        userFriendlyMessage: t`View field metadata already exists`,
      });
    }

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFieldToValidate.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: t`Field metadata not found`,
      });
    }

    const flatView = flatViewMaps.byId[flatViewFieldToValidate.viewId];

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: t`View not found`,
      });

      return validationResult;
    }

    const otherFlatViewFields = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatView.viewFieldIds,
      flatEntityMaps: optimisticFlatViewFieldMaps,
    });
    const equivalentExistingFlatViewFieldExists = otherFlatViewFields.some(
      (flatViewField) =>
        flatViewField.viewId === flatViewFieldToValidate.viewId &&
        flatViewField.fieldMetadataId ===
          flatViewFieldToValidate.fieldMetadataId,
    );

    if (equivalentExistingFlatViewFieldExists) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field with same fieldmetadataId and viewId already exists`,
        userFriendlyMessage: t`View field already exists`,
      });
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatView.objectMetadataId,
    });

    if (!isDefined(flatObjectMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field related view object metadata not found`,
        userFriendlyMessage: t`View field related view object metadata not found`,
      });
    } else {
      if (
        flatObjectMetadata.labelIdentifierFieldMetadataId ===
        flatViewFieldToValidate.fieldMetadataId
      ) {
        validationResult.errors.push(
          ...validateLabelIdentifierFieldMetadataIdFlatViewField({
            flatViewFieldToValidate,
            otherFlatViewFields,
          }),
        );
      }
    }

    return validationResult;
  }
}
