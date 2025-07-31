import { isDefined } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { ObjectMetadataException } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export type FailedFlatFieldMetadataValidationExceptions =
  | FieldMetadataException
  | ObjectMetadataException
  | InvalidMetadataException;

export type FlatFieldMetadataValidator<T> = {
  validator: (value: T) => boolean;
  message: string;
};

export const runFlatFieldMetadataValidator = <T>(
  elementToValidate: T,
  { message, validator }: FlatFieldMetadataValidator<T>,
): FailedFlatFieldMetadataValidationExceptions | undefined => {
  const validationFailed = validator(elementToValidate);

  if (validationFailed) {
    return new FieldMetadataException(
      message,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      {
        userFriendlyMessage: message,
      },
    );
  }
};

export const runFlatFieldMetadataValidators = <T>(
  elementToValidate: T,
  validators: FlatFieldMetadataValidator<T>[],
): FailedFlatFieldMetadataValidationExceptions[] =>
  validators
    .map((validator) =>
      runFlatFieldMetadataValidator(elementToValidate, validator),
    )
    .filter(isDefined);
