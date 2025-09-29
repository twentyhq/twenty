import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-properties-to-compare.constant';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatFieldMetadataRelationPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-relation-properties-to-compare.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import { isFlatFieldMetadataNameSyncedWithLabel } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-name-synced-with-label.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name-availability.util';
import { validateFlatFieldMetadataName } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-with-flat-field-maps-to-flat-object-metadatas.util';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type ValidateOneFieldMetadataArgs<
  T extends FieldMetadataType = FieldMetadataType,
> = {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  otherFlatObjectMetadataMapsToValidate?: FlatObjectMetadataMaps;
  flatFieldMetadataToValidate: FlatFieldMetadata<T>;
  workspaceId: string;
};

@Injectable()
export class FlatFieldMetadataValidatorService {
  constructor(
    private readonly flatFieldMetadataTypeValidatorService: FlatFieldMetadataTypeValidatorService,
  ) {}

  async validateFlatFieldMetadataUpdate<T extends FieldMetadataType>({
    existingFlatObjectMetadataMaps,
    flatFieldMetadataToValidate: updatedFlatFieldMetadata,
    workspaceId,
  }: ValidateOneFieldMetadataArgs<T>): Promise<
    FailedFlatEntityValidation<FlatFieldMetadata>
  > {
    const validationResult: FailedFlatEntityValidation<FlatFieldMetadata> = {
      type: 'update_field',
      errors: [],
      flatEntityMinimalInformation: {
        id: updatedFlatFieldMetadata.id,
        name: updatedFlatFieldMetadata.name,
        objectMetadataId: updatedFlatFieldMetadata.objectMetadataId,
      },
    };
    const flatObjectMetadataWithFlatFieldMaps =
      existingFlatObjectMetadataMaps.byId[
        updatedFlatFieldMetadata.objectMetadataId
      ];

    if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: 'field metadata to update object metadata not found',
        userFriendlyMessage: t`Object related to field to update not found`,
      });

      return validationResult;
    }

    if (
      !isDefined(
        flatObjectMetadataWithFlatFieldMaps.labelIdentifierFieldMetadataId,
      )
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND,
        message: 'Label identifier field metadata id does not exist',
        userFriendlyMessage: t`Object related to updated field does not have a label identifier`,
      });
    }

    const existingFlatFieldMetadataToUpdate =
      flatObjectMetadataWithFlatFieldMaps.fieldsById[
        updatedFlatFieldMetadata.id
      ];

    if (!isDefined(existingFlatFieldMetadataToUpdate)) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: 'field metadata to update not found',
        userFriendlyMessage: t`Field to update not found`,
      });

      return validationResult;
    }

    const updates = compareTwoFlatFieldMetadata({
      fromFlatFieldMetadata: existingFlatFieldMetadataToUpdate,
      toFlatFieldMetadata: updatedFlatFieldMetadata,
    });

    if (isMorphOrRelationFlatFieldMetadata(updatedFlatFieldMetadata)) {
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
          userFriendlyMessage: t`Forbidden updated properties for relation field metadata`,
        });
      }
    }

    const flatObjectMetadata =
      fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata(
        flatObjectMetadataWithFlatFieldMaps,
      );

    if (updates.some((update) => update.property === 'name')) {
      validationResult.errors.push(
        ...validateFlatFieldMetadataName(updatedFlatFieldMetadata.name),
        ...validateFlatFieldMetadataNameAvailability({
          flatFieldMetadata: updatedFlatFieldMetadata,
          flatObjectMetadata: flatObjectMetadata,
        }),
      );
    }

    if (
      updatedFlatFieldMetadata.isLabelSyncedWithName &&
      !isFlatFieldMetadataNameSyncedWithLabel(updatedFlatFieldMetadata)
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message: `Name is not synced with label.`,
        userFriendlyMessage: t`Updated field name is not synced with label`,
      });
    }

    const fieldMetadataTypeValidationErrors =
      await this.flatFieldMetadataTypeValidatorService.validateFlatFieldMetadataTypeSpecificities(
        {
          existingFlatObjectMetadataMaps,
          flatFieldMetadataToValidate: updatedFlatFieldMetadata,
          workspaceId,
        },
      );

    if (fieldMetadataTypeValidationErrors.length > 0) {
      validationResult.errors.push(...fieldMetadataTypeValidationErrors);
    }

    return validationResult;
  }

  validateFlatFieldMetadataDeletion({
    existingFlatObjectMetadataMaps,
    flatFieldMetadataToDelete,
  }: {
    flatFieldMetadataToDelete: FlatFieldMetadata;
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  }): FailedFlatEntityValidation<FlatFieldMetadata> {
    const validationResult: FailedFlatEntityValidation<FlatFieldMetadata> = {
      type: 'delete_field',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatFieldMetadataToDelete.id,
        name: flatFieldMetadataToDelete.name,
        objectMetadataId: flatFieldMetadataToDelete.objectMetadataId,
      },
    };

    const flatObjectMetadataWithFieldMaps =
      existingFlatObjectMetadataMaps.byId[
        flatFieldMetadataToDelete.objectMetadataId
      ];

    if (!isDefined(flatObjectMetadataWithFieldMaps)) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: 'field to delete object metadata not found',
        userFriendlyMessage: t`Object related to field to delete not found`,
      });
    } else {
      if (
        flatObjectMetadataWithFieldMaps.labelIdentifierFieldMetadataId ===
        flatFieldMetadataToDelete.id
      ) {
        validationResult.errors.push({
          code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
          message:
            'Cannot delete, please update the label identifier field first',
          userFriendlyMessage: t`Cannot delete, please update the label identifier field first`,
        });
      }
    }

    const isRelationFieldAndRelationTargetObjectMetadataHasBeenDeleted =
      isMorphOrRelationFlatFieldMetadata(flatFieldMetadataToDelete) &&
      !isDefined(
        existingFlatObjectMetadataMaps.byId[
          flatFieldMetadataToDelete.relationTargetObjectMetadataId
        ],
      );

    if (
      isStandardMetadata(flatFieldMetadataToDelete) &&
      !isRelationFieldAndRelationTargetObjectMetadataHasBeenDeleted
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: "Standard Fields can't be deleted",
        userFriendlyMessage: t`Standard fields cannot be deleted`,
      });
    }

    if (
      flatFieldMetadataToDelete.isActive &&
      !isRelationFieldAndRelationTargetObjectMetadataHasBeenDeleted
    ) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: "Active fields can't be deleted",
        userFriendlyMessage: t`Active fields cannot be deleted`,
      });
    }

    return validationResult;
  }

  async validateFlatFieldMetadataCreation<
    T extends FieldMetadataType = FieldMetadataType,
  >({
    existingFlatObjectMetadataMaps,
    flatFieldMetadataToValidate,
    otherFlatObjectMetadataMapsToValidate,
    workspaceId,
  }: ValidateOneFieldMetadataArgs<T>): Promise<
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
      otherFlatObjectMetadataMapsToValidate?.byId[
        flatFieldMetadataToValidate.objectMetadataId
      ] ??
      existingFlatObjectMetadataMaps.byId[
        flatFieldMetadataToValidate.objectMetadataId
      ];

    if (!isDefined(parentFlatObjectMetadata)) {
      validationResult.errors.push({
        code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: isDefined(otherFlatObjectMetadataMapsToValidate)
          ? 'Object metadata not found in both existing and about to be created object metadatas'
          : 'Object metadata not found',
        userFriendlyMessage: t`Field to create related object not found`,
      });
    } else {
      if (
        isDefined(
          parentFlatObjectMetadata.fieldsById[flatFieldMetadataToValidate.id],
        )
      ) {
        validationResult.errors.push({
          code: FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS,
          message: 'Field with same id already exists in object',
          userFriendlyMessage: t`Field already exists`,
        });
      }

      if (parentFlatObjectMetadata.isRemote === true) {
        validationResult.errors.push({
          code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
          message: 'Remote objects are read-only',
          userFriendlyMessage: t`Remote objects are not production ready yet`,
        });
      }

      validationResult.errors.push(
        ...validateFlatFieldMetadataNameAvailability({
          flatFieldMetadata: flatFieldMetadataToValidate,
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
        userFriendlyMessage: t`Field name is not synced with field label`,
        value: flatFieldMetadataToValidate.label,
      });
    }

    validationResult.errors.push(
      ...validateFlatFieldMetadataName(flatFieldMetadataToValidate.name),
    );

    validationResult.errors.push(
      ...(await this.flatFieldMetadataTypeValidatorService.validateFlatFieldMetadataTypeSpecificities(
        {
          existingFlatObjectMetadataMaps,
          flatFieldMetadataToValidate,
          workspaceId,
          otherFlatObjectMetadataMapsToValidate,
        },
      )),
    );

    return validationResult;
  }
}
