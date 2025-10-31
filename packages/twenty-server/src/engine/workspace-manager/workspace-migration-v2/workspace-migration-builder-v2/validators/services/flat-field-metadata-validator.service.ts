import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-properties-to-compare.constant';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatFieldMetadataRelationPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-relation-properties-to-compare.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataNameSyncedWithLabel } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-name-synced-with-label.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name-availability.util';
import { validateFlatFieldMetadataName } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name.util';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/utils/find-flat-entity-property-update.util';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatFieldMetadataValidatorService {
  constructor(
    private readonly flatFieldMetadataTypeValidatorService: FlatFieldMetadataTypeValidatorService,
  ) {}

  async validateFlatFieldMetadataUpdate({
    flatEntityId,
    flatEntityUpdates: updates,
    optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
    mutableDependencyOptimisticFlatEntityMaps,
    workspaceId,
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadata
  >): Promise<FailedFlatEntityValidation<FlatFieldMetadata>> {
    const validationResult: FailedFlatEntityValidation<FlatFieldMetadata> = {
      type: 'update_field',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingFlatFieldMetadataToUpdate =
      optimisticFlatFieldMetadataMaps.byId[flatEntityId];

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
      id: flatFieldMetadataToValidate.id,
      name: flatFieldMetadataToValidate.name,
      objectMetadataId: flatFieldMetadataToValidate.objectMetadataId,
    };

    const flatObjectMetadata =
      mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps.byId[
        flatFieldMetadataToValidate.objectMetadataId
      ];

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

    if (updates.some((update) => update.property === 'name')) {
      validationResult.errors.push(
        ...validateFlatFieldMetadataName(flatFieldMetadataToValidate.name),
        ...validateFlatFieldMetadataNameAvailability({
          flatFieldMetadata: flatFieldMetadataToValidate,
          flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
          flatObjectMetadata,
        }),
      );
    }

    if (
      flatFieldMetadataToValidate.isLabelSyncedWithName &&
      !isFlatFieldMetadataNameSyncedWithLabel(flatFieldMetadataToValidate)
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message: `Name is not synced with label.`,
        userFriendlyMessage: msg`Updated field name is not synced with label`,
      });
    }

    const fieldMetadataTypeValidationErrors =
      await this.flatFieldMetadataTypeValidatorService.validateFlatFieldMetadataTypeSpecificities(
        {
          mutableDependencyOptimisticFlatEntityMaps: {
            flatObjectMetadataMaps:
              mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
          },
          optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
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
    flatEntityToValidate: { id: flatFieldMetadataToDeleteId },
    optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
    mutableDependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.fieldMetadata
  >): FailedFlatEntityValidation<FlatFieldMetadata> {
    const validationResult: FailedFlatEntityValidation<FlatFieldMetadata> = {
      type: 'delete_field',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatFieldMetadataToDeleteId,
      },
    };

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
      name: flatFieldMetadataToDelete.name,
      objectMetadataId: flatFieldMetadataToDelete.objectMetadataId,
    };

    const relatedFlatObjectMetadata =
      mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps.byId[
        flatFieldMetadataToDelete.objectMetadataId
      ];

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
        mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps.byId[
          flatFieldMetadataToDelete.relationTargetObjectMetadataId
        ],
      );
    const parentObjectMetadataHasBeenDeleted = !isDefined(
      mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps.byId[
        flatFieldMetadataToDelete.objectMetadataId
      ],
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

    if (
      flatFieldMetadataToDelete.isActive &&
      !relationTargetObjectMetadataHasBeenDeleted &&
      !parentObjectMetadataHasBeenDeleted
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: "Active fields can't be deleted",
        userFriendlyMessage: msg`Active fields cannot be deleted`,
      });
    }

    return validationResult;
  }

  async validateFlatFieldMetadataCreation({
    flatEntityToValidate: flatFieldMetadataToValidate,
    optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
    mutableDependencyOptimisticFlatEntityMaps,
    workspaceId,
    buildOptions,
    remainingFlatEntityMapsToValidate,
  }: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.fieldMetadata>): Promise<
    FailedFlatEntityValidation<FlatFieldMetadata>
  > {
    const validationResult: FailedFlatEntityValidation<FlatFieldMetadata> = {
      errors: [],
      flatEntityMinimalInformation: {
        id: flatFieldMetadataToValidate.id,
        name: flatFieldMetadataToValidate.name,
        objectMetadataId: flatFieldMetadataToValidate.objectMetadataId,
      },
      type: 'create_field',
    };

    const parentFlatObjectMetadata =
      mutableDependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps.byId[
        flatFieldMetadataToValidate.objectMetadataId
      ];

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
          flatFieldMetadata: flatFieldMetadataToValidate,
          flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
          remainingFlatEntityMapsToValidate,
          flatObjectMetadata: parentFlatObjectMetadata,
        }),
      );
    }

    if (
      flatFieldMetadataToValidate.isLabelSyncedWithName &&
      !isFlatFieldMetadataNameSyncedWithLabel(flatFieldMetadataToValidate)
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL,
        message: `Name is not synced with label`,
        userFriendlyMessage: msg`Field name is not synced with field label`,
        value: flatFieldMetadataToValidate.label,
      });
    }

    validationResult.errors.push(
      ...validateFlatFieldMetadataName(flatFieldMetadataToValidate.name),
    );

    validationResult.errors.push(
      ...(await this.flatFieldMetadataTypeValidatorService.validateFlatFieldMetadataTypeSpecificities(
        {
          mutableDependencyOptimisticFlatEntityMaps,
          flatEntityToValidate: flatFieldMetadataToValidate,
          buildOptions,
          optimisticFlatEntityMaps: optimisticFlatFieldMetadataMaps,
          workspaceId,
          remainingFlatEntityMapsToValidate,
        },
      )),
    );

    return validationResult;
  }
}
