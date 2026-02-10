import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-properties-to-compare.constant';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatFieldMetadataRelationPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-relation-properties-to-compare.type';
import { isFlatFieldMetadataNameSyncedWithLabel } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-name-synced-with-label.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name-availability.util';
import { validateFlatFieldMetadataName } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name.util';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatFieldMetadataValidatorService {
  constructor(
    private readonly flatFieldMetadataTypeValidatorService: FlatFieldMetadataTypeValidatorService,
  ) {}

  validateFlatFieldMetadataUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
    workspaceId,
    buildOptions,
    additionalCacheDataMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadata
  >): FailedFlatEntityValidation<'fieldMetadata', 'update'> {
    const existingFlatFieldMetadataToUpdate =
      findFlatEntityByUniversalIdentifier({
        universalIdentifier,
        flatEntityMaps: optimisticFlatFieldMetadataMaps,
      });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'fieldMetadata',
      type: 'update',
    });

    if (!isDefined(existingFlatFieldMetadataToUpdate)) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: 'field metadata to update not found',
        userFriendlyMessage: msg`Field to update not found`,
      });

      return validationResult;
    }

    const flatFieldMetadataToValidate = {
      ...existingFlatFieldMetadataToUpdate,
      ...flatEntityUpdate,
    };

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      name: flatFieldMetadataToValidate.name,
      objectMetadataUniversalIdentifier:
        flatFieldMetadataToValidate.objectMetadataUniversalIdentifier,
    };

    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatFieldMetadataToValidate.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: 'field metadata to update object metadata not found',
        userFriendlyMessage: msg`Object related to field to update not found`,
      });

      return validationResult;
    }

    if (
      !isDefined(
        flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
      )
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND,
        message: 'Label identifier field metadata id does not exist',
        userFriendlyMessage: msg`Object related to updated field does not have a label identifier`,
      });
    } else if (
      flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
        flatFieldMetadataToValidate.universalIdentifier &&
      isDefined(flatEntityUpdate.isActive) &&
      flatFieldMetadataToValidate.isActive === false
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND,
        message: 'Label identifier field metadata cannot be deactivated',
        userFriendlyMessage: msg`Label identifier field cannot be deactivated`,
      });
    }

    // Should be moved in relation field validator
    if (
      isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadataToValidate)
    ) {
      const updatedProperties = Object.keys(flatEntityUpdate);
      const relationNonEditableUpdatedProperties = updatedProperties.filter(
        (property) =>
          !FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE.includes(
            property as FlatFieldMetadataRelationPropertiesToCompare,
          ),
      );

      if (relationNonEditableUpdatedProperties.length > 0) {
        validationResult.errors.push({
          code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
          message: `Forbidden updated properties for relation field metadata: ${relationNonEditableUpdatedProperties.join(', ')}`,
          userFriendlyMessage: msg`Forbidden updated properties for relation field metadata`,
        });
      }
    }
    ///

    if (isDefined(flatEntityUpdate.name)) {
      validationResult.errors.push(
        ...validateFlatFieldMetadataName({
          name: flatFieldMetadataToValidate.name,
          buildOptions,
        }),
        ...validateFlatFieldMetadataNameAvailability({
          name: flatFieldMetadataToValidate.name,
          universalFlatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
          universalFlatObjectMetadata: flatObjectMetadata,
          buildOptions,
        }),
      );
    }

    if (
      flatFieldMetadataToValidate.isLabelSyncedWithName &&
      !isFlatFieldMetadataNameSyncedWithLabel({
        flatFieldMetadata: flatFieldMetadataToValidate,
        isSystemBuild: buildOptions.isSystemBuild,
      })
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message: `Name is not synced with label.`,
        userFriendlyMessage: msg`Updated field name is not synced with label`,
      });
    }

    if (
      flatFieldMetadataToValidate.isNullable === false &&
      flatFieldMetadataToValidate.defaultValue === null
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: 'Default value cannot be null for non-nullable fields',
        userFriendlyMessage: msg`Default value cannot be null.`,
      });
    }

    const fieldMetadataTypeValidationErrors =
      this.flatFieldMetadataTypeValidatorService.validateFlatFieldMetadataTypeSpecificities(
        {
          update: flatEntityUpdate,
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
            flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
            flatObjectMetadataMaps,
          },
          flatEntityToValidate: flatFieldMetadataToValidate,
          buildOptions,
          remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
          workspaceId,
          additionalCacheDataMaps,
        },
      );

    if (fieldMetadataTypeValidationErrors.length > 0) {
      validationResult.errors.push(...fieldMetadataTypeValidationErrors);
    }

    return validationResult;
  }

  validateFlatFieldMetadataDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadata
  >): FailedFlatEntityValidation<'fieldMetadata', 'delete'> {
    const flatFieldMetadataToDelete = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatFieldMetadataMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'fieldMetadata',
      type: 'delete',
    });

    if (!isDefined(flatFieldMetadataToDelete)) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: 'Field metadata to delete not found',
        userFriendlyMessage: msg`Field metadata to delete not found`,
      });

      return validationResult;
    }

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      name: flatFieldMetadataToDelete.name,
      objectMetadataUniversalIdentifier:
        flatFieldMetadataToDelete.objectMetadataUniversalIdentifier,
    };

    const relatedFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatFieldMetadataToDelete.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (
      isDefined(relatedFlatObjectMetadata) &&
      relatedFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
        flatFieldMetadataToDelete.universalIdentifier
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message:
          'Cannot delete, please update the label identifier field first',
        userFriendlyMessage: msg`Cannot delete, please update the label identifier field first`,
      });
    }

    const relationTargetObjectMetadataHasBeenDeleted =
      isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadataToDelete) &&
      !isDefined(
        findFlatEntityByUniversalIdentifier({
          universalIdentifier:
            flatFieldMetadataToDelete.relationTargetObjectMetadataUniversalIdentifier,
          flatEntityMaps: flatObjectMetadataMaps,
        }),
      );
    const parentObjectMetadataHasBeenDeleted = !isDefined(
      findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatFieldMetadataToDelete.objectMetadataUniversalIdentifier,
        flatEntityMaps: flatObjectMetadataMaps,
      }),
    );

    if (
      belongsToTwentyStandardApp(flatFieldMetadataToDelete) &&
      !relationTargetObjectMetadataHasBeenDeleted &&
      !parentObjectMetadataHasBeenDeleted
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: "Standard Fields can't be deleted",
        userFriendlyMessage: msg`Standard fields cannot be deleted`,
      });
    }

    return validationResult;
  }

  validateFlatFieldMetadataCreation({
    flatEntityToValidate: flatFieldMetadataToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
    workspaceId,
    buildOptions,
    remainingFlatEntityMapsToValidate,
    additionalCacheDataMaps,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadata
  >): FailedFlatEntityValidation<'fieldMetadata', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatFieldMetadataToValidate.universalIdentifier,
        name: flatFieldMetadataToValidate.name,
        objectMetadataUniversalIdentifier:
          flatFieldMetadataToValidate.objectMetadataUniversalIdentifier,
      },
      metadataName: 'fieldMetadata',
      type: 'create',
    });

    const parentFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatFieldMetadataToValidate.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(parentFlatObjectMetadata)) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: 'Object metadata not found',
        userFriendlyMessage: msg`Field to create related object not found`,
      });
    } else {
      if (
        isDefined(
          findFlatEntityByUniversalIdentifier({
            universalIdentifier:
              flatFieldMetadataToValidate.universalIdentifier,
            flatEntityMaps: optimisticFlatFieldMetadataMaps,
          }),
        )
      ) {
        validationResult.errors.push({
          code: FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS,
          message:
            'Field with same universal identifier already exists in object',
          userFriendlyMessage: msg`Field already exists`,
        });
      }

      if (parentFlatObjectMetadata.isRemote === true) {
        validationResult.errors.push({
          code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
          message: 'Remote objects are read-only',
          userFriendlyMessage: msg`Remote objects are not production ready yet`,
        });
      }

      validationResult.errors.push(
        ...validateFlatFieldMetadataNameAvailability({
          name: flatFieldMetadataToValidate.name,
          universalFlatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
          universalFlatObjectMetadata: parentFlatObjectMetadata,
          buildOptions,
        }),
      );
    }

    if (
      flatFieldMetadataToValidate.isLabelSyncedWithName &&
      !isFlatFieldMetadataNameSyncedWithLabel({
        flatFieldMetadata: flatFieldMetadataToValidate,
        isSystemBuild: buildOptions.isSystemBuild,
      })
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL,
        message: `Name is not synced with label`,
        userFriendlyMessage: msg`Field name is not synced with field label`,
        value: flatFieldMetadataToValidate.label,
      });
    }

    validationResult.errors.push(
      ...validateFlatFieldMetadataName({
        name: flatFieldMetadataToValidate.name,
        buildOptions,
      }),
    );

    validationResult.errors.push(
      ...this.flatFieldMetadataTypeValidatorService.validateFlatFieldMetadataTypeSpecificities(
        {
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
            flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
            flatObjectMetadataMaps,
          },
          flatEntityToValidate: flatFieldMetadataToValidate,
          buildOptions,
          workspaceId,
          remainingFlatEntityMapsToValidate,
          additionalCacheDataMaps,
        },
      ),
    );

    return validationResult;
  }
}
