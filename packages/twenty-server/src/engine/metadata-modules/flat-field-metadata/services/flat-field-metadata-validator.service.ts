import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { type FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  compareTwoFlatFieldMetadata,
  type FlatFieldMetadataPropertiesToCompare,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/validate-flat-field-metadata-name-availability.validator';
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
import { validateMetadataName } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';

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
      const relationEditableFields = [
        'label',
        'description',
        'isActive',
      ] as const satisfies FlatFieldMetadataPropertiesToCompare[];
      const relationNonEditableUpdatedProperties = updates.flatMap(
        ({ property }) =>
          !relationEditableFields.includes(
            property as (typeof relationEditableFields)[number],
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
        ...[
          validateMetadataName(updatedFlatFieldMetadata.name),
          validateFlatFieldMetadataNameAvailability({
            name: updatedFlatFieldMetadata.name,
            flatObjectMetadata: flatObjectMetadata,
          }),
        ].filter(isDefined),
      );
    }

    if (updatedFlatFieldMetadata.isLabelSyncedWithName) {
      const computedName = computeMetadataNameFromLabel(
        updatedFlatFieldMetadata.label,
      );

      if (updatedFlatFieldMetadata.name !== computedName) {
        errors.push(
          new InvalidMetadataException(
            `Name is not synced with label. Expected name: "${computedName}", got ${updatedFlatFieldMetadata.name}`,
            InvalidMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL,
          ),
        );
      }
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

  async validateOneFlatFieldMetadataCreation<
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

    if (flatFieldMetadataToValidate.isLabelSyncedWithName) {
      const computedName = computeMetadataNameFromLabel(
        flatFieldMetadataToValidate.label,
      );

      if (flatFieldMetadataToValidate.name !== computedName) {
        errors.push(
          new InvalidMetadataException(
            `Name is not synced with label. Expected name: "${computedName}", got ${flatFieldMetadataToValidate.name}`,
            InvalidMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL,
          ),
        );
      }
    }

    const nameValidationResult = validateMetadataName(
      flatFieldMetadataToValidate.name,
    );

    if (isDefined(nameValidationResult)) {
      errors.push(nameValidationResult);
    }

    const fieldMetadataTypeValidationErrors =
      await this.flatFieldMetadataTypeValidatorService.validateFlatFieldMetadataTypeSpecificities(
        {
          existingFlatObjectMetadataMaps,
          flatFieldMetadataToValidate,
          workspaceId,
          otherFlatObjectMetadataMapsToValidate,
        },
      );

    if (fieldMetadataTypeValidationErrors.length > 0) {
      errors.push(...fieldMetadataTypeValidationErrors);
    }

    return errors;
  }
}
