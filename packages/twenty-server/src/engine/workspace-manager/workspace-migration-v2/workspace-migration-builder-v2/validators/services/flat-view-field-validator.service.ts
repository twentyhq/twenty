import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ALL_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-name.constant';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { isViewFieldInLowestPosition } from 'src/engine/metadata-modules/flat-view-field/utils/is-view-field-in-lowest-position.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { validateLabelIdentifierFieldMetadataIdFlatViewField } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-label-identifier-field-metadata-id-flat-view-field.util';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatViewFieldValidatorService {
  constructor() {}

  public validateFlatViewFieldUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMaps: optimisticFlatViewFieldMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewField
  >): FailedFlatEntityValidation<FlatViewField> {
    const validationResult: FailedFlatEntityValidation<FlatViewField> = {
      type: 'update_view_field',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingFlatViewField =
      optimisticFlatViewFieldMaps.byId[flatEntityId];

    if (!isDefined(existingFlatViewField)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field to update not found`,
        userFriendlyMessage: msg`View field to update not found`,
      });

      return validationResult;
    }

    const updatedFlatViewField = {
      ...existingFlatViewField,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    validationResult.flatEntityMinimalInformation = {
      id: updatedFlatViewField.id,
      viewId: updatedFlatViewField.viewId,
      fieldMetadataId: updatedFlatViewField.fieldMetadataId,
    };

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updatedFlatViewField.viewId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field to update parent view not found`,
        userFriendlyMessage: msg`View field to update parent view not found`,
      });

      return validationResult;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatView.objectMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field to update parent view object not found`,
        userFriendlyMessage: msg`View field to update parent view object not found`,
      });

      return validationResult;
    }

    if (
      flatObjectMetadata.labelIdentifierFieldMetadataId ===
      updatedFlatViewField.fieldMetadataId
    ) {
      const otherFlatViewFields = findManyFlatEntityByIdInFlatEntityMapsOrThrow(
        {
          flatEntityIds: flatView.viewFieldIds.filter(
            (flatViewId) => flatViewId !== updatedFlatViewField.id,
          ),
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
    flatEntityToValidate: { id: viewFieldIdToDelete },
    optimisticFlatEntityMaps: optimisticFlatViewFieldMaps,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewField
  >): FailedFlatEntityValidation<FlatViewField> {
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
        userFriendlyMessage: msg`View field to delete not found`,
      });
    }

    return validationResult;
  }

  public validateFlatViewFieldCreation({
    flatEntityToValidate: flatViewFieldToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewFieldMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewField
  >): FailedFlatEntityValidation<FlatViewField> {
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
        userFriendlyMessage: msg`View field metadata already exists`,
      });
    }

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFieldToValidate.fieldMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    const flatView =
      dependencyOptimisticFlatEntityMaps.flatViewMaps.byId[
        flatViewFieldToValidate.viewId
      ];

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
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
        userFriendlyMessage: msg`View field already exists`,
      });
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
      flatEntityId: flatView.objectMetadataId,
    });

    if (!isDefined(flatObjectMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field related view object metadata not found`,
        userFriendlyMessage: msg`View field related view object metadata not found`,
      });

      return validationResult;
    }

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
    } else if (
      otherFlatViewFields.some(
        (flatViewField) =>
          flatViewField.fieldMetadataId ===
          flatObjectMetadata.labelIdentifierFieldMetadataId,
      ) &&
      isViewFieldInLowestPosition({
        flatViewField: flatViewFieldToValidate,
        otherFlatViewFields,
      })
    ) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field position cannot be lower than label identifier view field position`,
        userFriendlyMessage: msg`View field position cannot be lower than label identifier view field position`,
      });
    }

    return validationResult;
  }
}
