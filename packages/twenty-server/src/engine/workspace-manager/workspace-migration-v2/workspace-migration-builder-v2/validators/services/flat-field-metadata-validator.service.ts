import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-properties-to-compare.constant';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatFieldMetadataRelationPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-relation-properties-to-compare.type';
import { isFlatFieldMetadataNameSyncedWithLabel } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-name-synced-with-label.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name-availability.util';
import { validateFlatFieldMetadataName } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name.util';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/utils/find-flat-entity-property-update.util';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatFieldMetadataValidatorService {
  constructor(
    private readonly flatFieldMetadataTypeValidatorService: FlatFieldMetadataTypeValidatorService,
  ) {}

  validateFlatFieldMetadataUpdate({
    flatEntityId,
    flatEntityUpdates: updates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
    workspaceId,
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadata
  >): FailedFlatEntityValidation<'fieldMetadata', 'update'> {
    const existingFlatFieldMetadataToUpdate =
      optimisticFlatFieldMetadataMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier:
          existingFlatFieldMetadataToUpdate?.universalIdentifier,
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
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({ updates }),
    };

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      id: flatFieldMetadataToValidate.id,
      name: flatFieldMetadataToValidate.name,
      objectMetadataId: flatFieldMetadataToValidate.objectMetadataId,
    };

    const flatObjectMetadata =
      flatObjectMetadataMaps.byId[flatFieldMetadataToValidate.objectMetadataId];

    if (!isDefined(flatObjectMetadata)) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: 'field metadata to update object metadata not found',
        userFriendlyMessage: msg`Object related to field to update not found`,
      });

      return validationResult;
    }

    if (!isDefined(flatObjectMetadata.labelIdentifierFieldMetadataId)) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND,
        message: 'Label identifier field metadata id does not exist',
        userFriendlyMessage: msg`Object related to updated field does not have a label identifier`,
      });
    } else if (
      flatObjectMetadata.labelIdentifierFieldMetadataId ===
        flatFieldMetadataToValidate.id &&
      isDefined(
        findFlatEntityPropertyUpdate({
          flatEntityUpdates: updates,
          property: 'isActive',
        }),
      ) &&
      flatFieldMetadataToValidate.isActive === false
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND,
        message: 'Label identifier field metadata cannot be deactivated',
        userFriendlyMessage: msg`Label identifier field cannot be deactivated`,
      });
    }

    // Should be moved in relation field validator
    if (isMorphOrRelationFlatFieldMetadata(flatFieldMetadataToValidate)) {
      const relationNonEditableUpdatedProperties = updates.flatMap(
        ({ property }) =>
          !FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE.includes(
            property as FlatFieldMetadataRelationPropertiesToCompare,
          )
            ? property
            : [],
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

    if (updates.some((update) => update.property === 'name')) {
      validationResult.errors.push(
        ...validateFlatFieldMetadataName({
          name: flatFieldMetadataToValidate.name,
          buildOptions,
        }),
        ...validateFlatFieldMetadataNameAvailability({
          name: flatFieldMetadataToValidate.name,
          flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
          flatObjectMetadata,
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
          updates,
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
            flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
            flatObjectMetadataMaps,
          },
          flatEntityToValidate: flatFieldMetadataToValidate,
          buildOptions,
          remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
          workspaceId,
        },
      );

    if (fieldMetadataTypeValidationErrors.length > 0) {
      validationResult.errors.push(...fieldMetadataTypeValidationErrors);
    }

    return validationResult;
  }

  validateFlatFieldMetadataDeletion({
    flatEntityToValidate: {
      id: flatFieldMetadataToDeleteId,
      universalIdentifier,
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadata
  >): FailedFlatEntityValidation<'fieldMetadata', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatFieldMetadataToDeleteId,
        universalIdentifier,
      },
      metadataName: 'fieldMetadata',
      type: 'delete',
    });

    const flatFieldMetadataToDelete =
      optimisticFlatFieldMetadataMaps.byId[flatFieldMetadataToDeleteId];

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
      objectMetadataId: flatFieldMetadataToDelete.objectMetadataId,
    };

    const relatedFlatObjectMetadata =
      flatObjectMetadataMaps.byId[flatFieldMetadataToDelete.objectMetadataId];

    if (
      isDefined(relatedFlatObjectMetadata) &&
      relatedFlatObjectMetadata.labelIdentifierFieldMetadataId ===
        flatFieldMetadataToDelete.id
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message:
          'Cannot delete, please update the label identifier field first',
        userFriendlyMessage: msg`Cannot delete, please update the label identifier field first`,
      });
    }

    const relationTargetObjectMetadataHasBeenDeleted =
      isMorphOrRelationFlatFieldMetadata(flatFieldMetadataToDelete) &&
      !isDefined(
        flatObjectMetadataMaps.byId[
          flatFieldMetadataToDelete.relationTargetObjectMetadataId
        ],
      );
    const parentObjectMetadataHasBeenDeleted = !isDefined(
      flatObjectMetadataMaps.byId[flatFieldMetadataToDelete.objectMetadataId],
    );

    if (
      isStandardMetadata(flatFieldMetadataToDelete) &&
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
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadata
  >): FailedFlatEntityValidation<'fieldMetadata', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatFieldMetadataToValidate.id,
        universalIdentifier: flatFieldMetadataToValidate.universalIdentifier,
        name: flatFieldMetadataToValidate.name,
        objectMetadataId: flatFieldMetadataToValidate.objectMetadataId,
      },
      metadataName: 'fieldMetadata',
      type: 'create',
    });

    const parentFlatObjectMetadata =
      flatObjectMetadataMaps.byId[flatFieldMetadataToValidate.objectMetadataId];

    if (!isDefined(parentFlatObjectMetadata)) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: 'Object metadata not found',
        userFriendlyMessage: msg`Field to create related object not found`,
      });
    } else {
      if (
        isDefined(
          optimisticFlatFieldMetadataMaps.byId[flatFieldMetadataToValidate.id],
        )
      ) {
        validationResult.errors.push({
          code: FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS,
          message: 'Field with same id already exists in object',
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
          flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
          flatObjectMetadata: parentFlatObjectMetadata,
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
        },
      ),
    );

    return validationResult;
  }
}
