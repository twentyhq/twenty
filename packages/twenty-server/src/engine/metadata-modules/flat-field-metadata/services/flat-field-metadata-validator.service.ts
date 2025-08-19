import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-properties-to-compare.constant';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import {
  FailedFlatFieldMetadataValidation,
} from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FlatFieldMetadataIdObjectIdAndName } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-id-object-id-and-name.type';
import { FlatFieldMetadataRelationPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-relation-properties-to-compare.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import { isFlatFieldMetadataNameSyncedWithLabel } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-name-synced-with-label.util';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-flat-field-metadata.util';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name-availability.util';
import { validateFlatFieldMetadataName } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-with-flat-field-maps-to-flat-object-metadatas.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { InvalidMetadataExceptionCode } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';

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
    FailedFlatFieldMetadataValidation[]
  > {
    const errors: FailedFlatFieldMetadataValidation[] = [];
    const flatObjectMetadataWithFlatFieldMaps =
      existingFlatObjectMetadataMaps.byId[
        updatedFlatFieldMetadata.objectMetadataId
      ];
    const flatFieldMetadataToValidateMinimalInformation: FlatFieldMetadataIdObjectIdAndName =
      {
        id: updatedFlatFieldMetadata.id,
        name: updatedFlatFieldMetadata.name,
        objectMetadataId: updatedFlatFieldMetadata.objectMetadataId,
      };

    if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
      return [
        {
          error: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
          message: 'field metadata to update object metadata not found',
          userFriendlyMessage: t`Object related to field to update not found`,
          ...flatFieldMetadataToValidateMinimalInformation,
        },
      ];
    }
    if (
      !isDefined(
        flatObjectMetadataWithFlatFieldMaps.labelIdentifierFieldMetadataId,
      )
    ) {
      errors.push({
        error:
          FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND,
        message: 'Label identifier field metadata id does not exist',
        userFriendlyMessage: t`Object related to updated field doesnot have a label identifier`,
        ...flatFieldMetadataToValidateMinimalInformation,
      });
    }

    const existingFlatFieldMetadataToUpdate =
      flatObjectMetadataWithFlatFieldMaps.fieldsById[
        updatedFlatFieldMetadata.id
      ];

    if (!isDefined(existingFlatFieldMetadataToUpdate)) {
      errors.push({
        error: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: 'field metadata to update not found',
        userFriendlyMessage: t`Field to update not found`,
        ...flatFieldMetadataToValidateMinimalInformation,
      });

      return errors;
    }

    const updates = compareTwoFlatFieldMetadata({
      from: existingFlatFieldMetadataToUpdate,
      to: updatedFlatFieldMetadata,
    });

    if (
      isFlatFieldMetadataEntityOfType(
        updatedFlatFieldMetadata,
        FieldMetadataType.RELATION,
      ) ||
      isFlatFieldMetadataEntityOfType(
        updatedFlatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      )
    ) {
      const relationNonEditableUpdatedProperties = updates.flatMap(
        ({ property }) =>
          !FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE.includes(
            property as FlatFieldMetadataRelationPropertiesToCompare,
          )
            ? property
            : [],
      );

      if (relationNonEditableUpdatedProperties.length > 0) {
        errors.push({
          error: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
          message: `Forbidden updated properties for relation field metadata: ${relationNonEditableUpdatedProperties.join(', ')}`,
          userFriendlyMessage: t`Forbidden updated properties for relation field metadata`,
          ...flatFieldMetadataToValidateMinimalInformation,
        });
      }
    }

    const flatObjectMetadata =
      fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata(
        flatObjectMetadataWithFlatFieldMaps,
      );

    if (updates.some((update) => update.property === 'name')) {
      errors.push(
        ...validateFlatFieldMetadataName(
          flatFieldMetadataToValidateMinimalInformation,
        ),
        ...validateFlatFieldMetadataNameAvailability({
          flatFieldMetadata: flatFieldMetadataToValidateMinimalInformation,
          flatObjectMetadata: flatObjectMetadata,
        }),
      );
    }

    if (
      updatedFlatFieldMetadata.isLabelSyncedWithName &&
      !isFlatFieldMetadataNameSyncedWithLabel(updatedFlatFieldMetadata)
    ) {
      errors.push({
        error: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message: `Name is not synced with label.`,
        userFriendlyMessage: t`Updated field name is not synced with label`,
        ...flatFieldMetadataToValidateMinimalInformation,
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
      errors.push(...fieldMetadataTypeValidationErrors);
    }

    return errors;
  }

  validateFlatFieldMetadataDeletion({
    existingFlatObjectMetadataMaps,
    flatFieldMetadataToDelete,
  }: {
    flatFieldMetadataToDelete: FlatFieldMetadata;
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  }): FailedFlatFieldMetadataValidation[] {
    const errors: FailedFlatFieldMetadataValidation[] = [];

    const flatFieldMetadataToDeleteMinimalInformation: FlatFieldMetadataIdObjectIdAndName =
      {
        id: flatFieldMetadataToDelete.id,
        name: flatFieldMetadataToDelete.name,
        objectMetadataId: flatFieldMetadataToDelete.objectMetadataId,
      };
    const flatObjectMetadataWithFieldMaps =
      existingFlatObjectMetadataMaps.byId[
        flatFieldMetadataToDelete.objectMetadataId
      ];

    if (!isDefined(flatObjectMetadataWithFieldMaps)) {
      errors.push({
        error: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: 'field to delete object metadata not found',
        userFriendlyMessage: t`Object related to field to delete not found`,
        ...flatFieldMetadataToDeleteMinimalInformation,
      });
    } else {
      if (
        flatObjectMetadataWithFieldMaps.labelIdentifierFieldMetadataId ===
        flatFieldMetadataToDelete.id
      ) {
        errors.push({
          error: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
          message:
            'Cannot delete, please update the label identifier field first',
          userFriendlyMessage: t`Cannot delete, please update the label identifier field first`,
          ...flatFieldMetadataToDeleteMinimalInformation,
        });
      }
    }

    const isRelationFieldAndRelationTargetObjectMetadataHasBeenDeleted =
      isRelationFlatFieldMetadata(flatFieldMetadataToDelete) &&
      !isDefined(
        existingFlatObjectMetadataMaps.byId[
          flatFieldMetadataToDelete.relationTargetObjectMetadataId
        ],
      );

    if (
      isStandardMetadata(flatFieldMetadataToDelete) &&
      !isRelationFieldAndRelationTargetObjectMetadataHasBeenDeleted
    ) {
      errors.push({
        error: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: "Standard Fields can't be deleted",
        userFriendlyMessage: t`Standard fields cannot be deleted`,
        ...flatFieldMetadataToDeleteMinimalInformation,
      });
    }

    if (
      flatFieldMetadataToDelete.isActive &&
      !isRelationFieldAndRelationTargetObjectMetadataHasBeenDeleted
    ) {
      errors.push({
        error: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: "Active fields can't be deleted",
        userFriendlyMessage: t`Active fields cannot be deleted`,
        ...flatFieldMetadataToDeleteMinimalInformation,
      });
    }

    return errors;
  }

  async validateFlatFieldMetadataCreation<
    T extends FieldMetadataType = FieldMetadataType,
  >({
    existingFlatObjectMetadataMaps,
    flatFieldMetadataToValidate,
    otherFlatObjectMetadataMapsToValidate,
    workspaceId,
  }: ValidateOneFieldMetadataArgs<T>): Promise<
    FailedFlatFieldMetadataValidation[]
  > {
    const errors: FailedFlatFieldMetadataValidation[] = [];

    const parentFlatObjectMetadata =
      otherFlatObjectMetadataMapsToValidate?.byId[
        flatFieldMetadataToValidate.objectMetadataId
      ] ??
      existingFlatObjectMetadataMaps.byId[
        flatFieldMetadataToValidate.objectMetadataId
      ];

    const flatFieldMetadataIdObjectIdAndName: FlatFieldMetadataIdObjectIdAndName =
      {
        id: flatFieldMetadataToValidate.id,
        name: flatFieldMetadataToValidate.name,
        objectMetadataId: flatFieldMetadataToValidate.objectMetadataId,
      };

    if (!isDefined(parentFlatObjectMetadata)) {
      errors.push({
        error: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: isDefined(otherFlatObjectMetadataMapsToValidate)
          ? 'Object metadata not found in both existing and about to be created object metadatas'
          : 'Object metadata not found',
        userFriendlyMessage: t`Field to create related object not found`,
        ...flatFieldMetadataIdObjectIdAndName,
      });
    } else {
      if (
        isDefined(
          parentFlatObjectMetadata.fieldsById[flatFieldMetadataToValidate.id],
        )
      ) {
        errors.push({
          error: ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED,
          message: 'Field with same id already exists in object',
          userFriendlyMessage: t`Field already exists`,
          ...flatFieldMetadataIdObjectIdAndName,
        });
      }

      if (parentFlatObjectMetadata.isRemote === true) {
        errors.push({
          error: ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED,
          message: 'Remote objects are read-only',
          userFriendlyMessage: t`Remote objects are not production ready yet`,
          ...flatFieldMetadataIdObjectIdAndName,
        });
      }

      errors.push(
        ...validateFlatFieldMetadataNameAvailability({
          flatFieldMetadata: flatFieldMetadataIdObjectIdAndName,
          flatObjectMetadata: parentFlatObjectMetadata,
        }),
      );
    }

    if (
      flatFieldMetadataToValidate.isLabelSyncedWithName &&
      !isFlatFieldMetadataNameSyncedWithLabel(flatFieldMetadataToValidate)
    ) {
      errors.push({
        error: InvalidMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL,
        message: `Name is not synced with label`,
        userFriendlyMessage: t`Field name is not synced with field label`,
        ...flatFieldMetadataIdObjectIdAndName,
        value: flatFieldMetadataToValidate.label,
      });
    }

    errors.push(
      ...validateFlatFieldMetadataName(flatFieldMetadataIdObjectIdAndName),
    );

    errors.push(
      ...(await this.flatFieldMetadataTypeValidatorService.validateFlatFieldMetadataTypeSpecificities(
        {
          existingFlatObjectMetadataMaps,
          flatFieldMetadataToValidate,
          workspaceId,
          otherFlatObjectMetadataMapsToValidate,
        },
      )),
    );

    return errors;
  }
}
