import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { isViewFieldInLowestPosition } from 'src/engine/metadata-modules/flat-view-field/utils/is-view-field-in-lowest-position.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { validateLabelIdentifierFieldMetadataIdFlatViewField } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-label-identifier-field-metadata-id-flat-view-field.util';

@Injectable()
export class FlatViewFieldValidatorService {
  constructor() {}

  public validateFlatViewFieldUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFieldMaps: optimisticFlatViewFieldMaps,
      flatViewMaps,
      flatObjectMetadataMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewField
  >): FailedFlatEntityValidation<'viewField', 'update'> {
    const existingFlatViewField = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewFieldMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
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
      ...flatEntityUpdate,
    };

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      viewUniversalIdentifier: updatedFlatViewField.viewUniversalIdentifier,
      fieldMetadataUniversalIdentifier:
        updatedFlatViewField.fieldMetadataUniversalIdentifier,
    };

    const flatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: updatedFlatViewField.viewUniversalIdentifier,
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

    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatView.objectMetadataUniversalIdentifier,
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
      flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
      updatedFlatViewField.fieldMetadataUniversalIdentifier
    ) {
      const otherFlatViewFields =
        findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow(
          {
            universalIdentifiers: flatView.viewFieldUniversalIdentifiers.filter(
              (viewFieldUniversalIdentifier) =>
                viewFieldUniversalIdentifier !==
                updatedFlatViewField.universalIdentifier,
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
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFieldMaps: optimisticFlatViewFieldMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewField
  >): FailedFlatEntityValidation<'viewField', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'viewField',
      type: 'delete',
    });

    const existingFlatViewField = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewFieldMaps,
    });

    if (!isDefined(existingFlatViewField)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field to delete not found`,
        userFriendlyMessage: msg`View field to delete not found`,
      });

      return validationResult;
    }

    const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        existingFlatViewField.fieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      return validationResult;
    }

    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatFieldMetadata.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return validationResult;
    }

    if (
      flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
      existingFlatViewField.fieldMetadataUniversalIdentifier
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
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewField
  >): FailedFlatEntityValidation<'viewField', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatViewFieldToValidate.universalIdentifier,
        viewUniversalIdentifier:
          flatViewFieldToValidate.viewUniversalIdentifier,
        fieldMetadataUniversalIdentifier:
          flatViewFieldToValidate.fieldMetadataUniversalIdentifier,
      },
      metadataName: 'viewField',
      type: 'create',
    });

    const existingFlatViewField = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewFieldToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatViewFieldMaps,
    });

    if (isDefined(existingFlatViewField)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field metadata with this universal identifier already exists`,
        userFriendlyMessage: msg`View field metadata already exists`,
      });
    }

    const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatViewFieldToValidate.fieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    const flatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewFieldToValidate.viewUniversalIdentifier,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });

      return validationResult;
    }

    const otherFlatViewFields =
      findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow({
        universalIdentifiers: flatView.viewFieldUniversalIdentifiers,
        flatEntityMaps: optimisticFlatViewFieldMaps,
      });
    const equivalentExistingFlatViewFieldExists = otherFlatViewFields.some(
      (flatViewField) =>
        flatViewField.viewUniversalIdentifier ===
          flatViewFieldToValidate.viewUniversalIdentifier &&
        flatViewField.fieldMetadataUniversalIdentifier ===
          flatViewFieldToValidate.fieldMetadataUniversalIdentifier,
    );

    if (equivalentExistingFlatViewFieldExists) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field with same fieldMetadataUniversalIdentifier and viewUniversalIdentifier already exists`,
        userFriendlyMessage: msg`View field already exists`,
      });
    }

    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: flatView.objectMetadataUniversalIdentifier,
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
      flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
      flatViewFieldToValidate.fieldMetadataUniversalIdentifier
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
          flatViewField.fieldMetadataUniversalIdentifier ===
          flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
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
