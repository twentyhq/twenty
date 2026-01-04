import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isViewFieldInLowestPosition } from 'src/engine/metadata-modules/flat-view-field/utils/is-view-field-in-lowest-position.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
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
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFieldMaps: optimisticFlatViewFieldMaps,
      flatViewMaps,
      flatObjectMetadataMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewField
  >): FailedFlatEntityValidation<'viewField', 'update'> {
    const existingFlatViewField =
      optimisticFlatViewFieldMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingFlatViewField?.universalIdentifier,
      },
      metadataName: 'viewField',
      type: 'update',
    });

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
      ...validationResult.flatEntityMinimalInformation,
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
        userFriendlyMessage: msg`View field to update parent view not found`,
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
    flatEntityToValidate: { id: viewFieldIdToDelete, universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFieldMaps: optimisticFlatViewFieldMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewField
  >): FailedFlatEntityValidation<'viewField', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: viewFieldIdToDelete,
        universalIdentifier,
      },
      metadataName: 'viewField',
      type: 'delete',
    });

    const existingFlatViewField =
      optimisticFlatViewFieldMaps.byId[viewFieldIdToDelete];

    if (!isDefined(existingFlatViewField)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field to delete not found`,
        userFriendlyMessage: msg`View field to delete not found`,
      });

      return validationResult;
    }

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: existingFlatViewField.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      return validationResult;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatFieldMetadata.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return validationResult;
    }

    if (
      flatObjectMetadata.labelIdentifierFieldMetadataId ===
      existingFlatViewField.fieldMetadataId
    ) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Label identifier view field cannot be deleted`,
        userFriendlyMessage: msg`Label identifier view field cannot be deleted`,
      });
    }

    return validationResult;
  }

  public validateFlatViewFieldCreation({
    flatEntityToValidate: flatViewFieldToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFieldMaps: optimisticFlatViewFieldMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
      flatObjectMetadataMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewField
  >): FailedFlatEntityValidation<'viewField', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatViewFieldToValidate.id,
        universalIdentifier: flatViewFieldToValidate.universalIdentifier,
        viewId: flatViewFieldToValidate.viewId,
        fieldMetadataId: flatViewFieldToValidate.fieldMetadataId,
      },
      metadataName: 'viewField',
      type: 'create',
    });

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
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    const flatView = flatViewMaps.byId[flatViewFieldToValidate.viewId];

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
      flatEntityMaps: flatObjectMetadataMaps,
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
