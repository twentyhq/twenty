import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/validate-flat-field-metadata-name-availability.validator';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { mergeTwoFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/merge-two-flat-object-metadatas.util';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';

export type ValidateOneFieldMetadataArgs<
  T extends FieldMetadataType = FieldMetadataType,
> = {
  existingFlatObjectMetadatas: FlatObjectMetadata[];
  othersFlatObjectMetadataToValidate?: FlatObjectMetadata[];
  flatFieldMetadataToValidate: FlatFieldMetadata<T>;
  workspaceId: string;
};

@Injectable()
export class FlatFieldMetadataValidatorService {
  constructor(
    private readonly flatFieldMetadataTypeValidatorService: FlatFieldMetadataTypeValidatorService,
  ) {}

  async validateOneFlatFieldMetadata<
    T extends FieldMetadataType = FieldMetadataType,
  >({
    existingFlatObjectMetadatas,
    flatFieldMetadataToValidate,
    othersFlatObjectMetadataToValidate,
    workspaceId,
  }: ValidateOneFieldMetadataArgs<T>): Promise<
    FailedFlatFieldMetadataValidationExceptions[]
  > {
    const errors: FailedFlatFieldMetadataValidationExceptions[] = [];

    const allFlatObjectMetadata = isDefined(othersFlatObjectMetadataToValidate)
      ? mergeTwoFlatObjectMetadatas({
          destFlatObjectMetadatas: existingFlatObjectMetadatas,
          toMergeFlatObjectMetadatas: othersFlatObjectMetadataToValidate,
        })
      : existingFlatObjectMetadatas;

    const parentFlatObjectMetadata = allFlatObjectMetadata.find(
      (existingFlatObjectMetadata) =>
        existingFlatObjectMetadata.id ===
        flatFieldMetadataToValidate.objectMetadataId,
    );

    if (!isDefined(parentFlatObjectMetadata)) {
      errors.push(
        new FieldMetadataException(
          isDefined(othersFlatObjectMetadataToValidate)
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
          objectMetadata: parentFlatObjectMetadata,
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

    try {
      validateMetadataNameOrThrow(flatFieldMetadataToValidate.name);
    } catch (error) {
      errors.push(
        new FieldMetadataException(
          error.message,
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          {
            userFriendlyMessage: error.userFriendlyMessage,
          },
        ),
      );
    }

    const fieldMetadataTypeValidator =
      this.flatFieldMetadataTypeValidatorService
        .FIELD_METADATA_TYPE_VALIDATOR_HASHMAP[
        flatFieldMetadataToValidate.type
      ];

    if (!isDefined(fieldMetadataTypeValidator)) {
      errors.push(
        new FieldMetadataException(
          'Unsupported field metadata type',
          FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION,
        ),
      );
    } else {
      const fieldMetadataTypeValidatorExceptions =
        await fieldMetadataTypeValidator({
          existingFlatObjectMetadatas,
          flatFieldMetadataToValidate,
          workspaceId,
          othersFlatObjectMetadataToValidate,
        });

      errors.push(...fieldMetadataTypeValidatorExceptions);
    }

    return errors;
  }
}
