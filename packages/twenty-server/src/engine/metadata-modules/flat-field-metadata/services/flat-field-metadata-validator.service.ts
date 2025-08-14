import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-properties-to-compare.constant';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { type FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FlatFieldMetadataRelationPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-relation-properties-to-compare.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { compareTwoFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import { isFlatFieldMetadataNameSyncedWithLabel } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-name-synced-with-label.util';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name-availability.util';
import { validateFlatFieldMetadataName } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-with-flat-field-maps-to-flat-object-metadatas.util';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

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
    FailedFlatFieldMetadataValidationExceptions[]
  > {
    const errors: FailedFlatFieldMetadataValidationExceptions[] = [];
    const flatObjectMetadataWithFlatFieldMaps =
      existingFlatObjectMetadataMaps.byId[
        updatedFlatFieldMetadata.objectMetadataId
      ];

    if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
      return [
        new FieldMetadataException(
          'field metadata to update object metadata not found',
          FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        ),
      ];
    }
    if (
      !isDefined(
        flatObjectMetadataWithFlatFieldMaps.labelIdentifierFieldMetadataId,
      )
    ) {
      errors.push(
        new FieldMetadataException(
          'Label identifier field metadata id does not exist',
          FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND,
        ),
      );
    }

    const existingFlatFieldMetadataToUpdate =
      flatObjectMetadataWithFlatFieldMaps.fieldsById[
        updatedFlatFieldMetadata.id
      ];

    if (!isDefined(existingFlatFieldMetadataToUpdate)) {
      errors.push(
        new FieldMetadataException(
          'field metadata to update not found',
          FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        ),
      );

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
        errors.push(
          new FieldMetadataException(
            `Forbidden updated properties for relation field metadata: ${relationNonEditableUpdatedProperties.join(', ')}`,
            FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
          ),
        );
      }
    }

    const flatObjectMetadata =
      fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata(
        flatObjectMetadataWithFlatFieldMaps,
      );

    if (updates.some((update) => update.property === 'name')) {
      errors.push(
        ...validateFlatFieldMetadataName(updatedFlatFieldMetadata.name),
      );

      const nameAvailabilityValidationError =
        validateFlatFieldMetadataNameAvailability({
          name: updatedFlatFieldMetadata.name,
          flatObjectMetadata: flatObjectMetadata,
        });

      if (isDefined(nameAvailabilityValidationError)) {
        errors.push(nameAvailabilityValidationError);
      }
    }

    if (
      updatedFlatFieldMetadata.isLabelSyncedWithName &&
      !isFlatFieldMetadataNameSyncedWithLabel(updatedFlatFieldMetadata)
    ) {
      errors.push(
        new InvalidMetadataException(
          t`Name is not synced with label.`,
          InvalidMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL,
        ),
      );
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
  }): FailedFlatFieldMetadataValidationExceptions[] {
    const errors: FailedFlatFieldMetadataValidationExceptions[] = [];

    const flatObjectMetadataWithFieldMaps =
      existingFlatObjectMetadataMaps.byId[
        flatFieldMetadataToDelete.objectMetadataId
      ];

    if (!isDefined(flatObjectMetadataWithFieldMaps)) {
      errors.push(
        new FieldMetadataException(
          'field to delete object metadata not found',
          FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        ),
      );
    } else {
      if (
        flatObjectMetadataWithFieldMaps.labelIdentifierFieldMetadataId ===
        flatFieldMetadataToDelete.id
      ) {
        errors.push(
          new FieldMetadataException(
            'Cannot delete, please update the label identifier field first',
            FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
            {
              userFriendlyMessage: t`Cannot delete, please update the label identifier field first`,
            },
          ),
        );
      }
    }

    if (!flatFieldMetadataToDelete.isCustom) {
      errors.push(
        new FieldMetadataException(
          "Standard Fields can't be deleted",
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        ),
      );
    }

    if (flatFieldMetadataToDelete.isActive) {
      errors.push(
        new FieldMetadataException(
          "Active fields can't be deleted",
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        ),
      );
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
    FailedFlatFieldMetadataValidationExceptions[]
  > {
    const errors: FailedFlatFieldMetadataValidationExceptions[] = [];

    const parentFlatObjectMetadata =
      otherFlatObjectMetadataMapsToValidate?.byId[
        flatFieldMetadataToValidate.objectMetadataId
      ] ??
      existingFlatObjectMetadataMaps.byId[
        flatFieldMetadataToValidate.objectMetadataId
      ];

    if (!isDefined(parentFlatObjectMetadata)) {
      errors.push(
        new FieldMetadataException(
          isDefined(otherFlatObjectMetadataMapsToValidate)
            ? 'Object metadata not found in both existing and about to be created object metadatas'
            : 'Object metadata not found',
          FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        ),
      );
    } else {
      if (parentFlatObjectMetadata.isRemote === true) {
        errors.push(
          new ObjectMetadataException(
            'Remote objects are read-only',
            ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED,
          ),
        );
      }

      const failedNameAvailabilityValidation =
        validateFlatFieldMetadataNameAvailability({
          name: flatFieldMetadataToValidate.name,
          flatObjectMetadata: parentFlatObjectMetadata,
        });

      if (isDefined(failedNameAvailabilityValidation)) {
        errors.push(failedNameAvailabilityValidation);
      }
    }

    if (
      flatFieldMetadataToValidate.isLabelSyncedWithName &&
      !isFlatFieldMetadataNameSyncedWithLabel(flatFieldMetadataToValidate)
    ) {
      errors.push(
        new InvalidMetadataException(
          t`Name is not synced with label.`,
          InvalidMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL,
        ),
      );
    }

    errors.push(
      ...validateFlatFieldMetadataName(flatFieldMetadataToValidate.name),
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
