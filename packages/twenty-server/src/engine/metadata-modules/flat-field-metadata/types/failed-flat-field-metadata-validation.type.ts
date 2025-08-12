import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { runFlatFieldMetadataValidator } from 'src/engine/metadata-modules/flat-field-metadata/utils/run-flat-field-metadata-validator.util';
import { type ObjectMetadataException } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';
import { type InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export type FailedFlatFieldMetadataValidationExceptions =
  | FieldMetadataException
  | ObjectMetadataException
  | InvalidMetadataException;

export const runFlatFieldMetadataValidators = <T>(
  elementToValidate: T,
  validators: FlatMetadataValidator<T>[],
): FailedFlatFieldMetadataValidationExceptions[] =>
  validators
    .map((validator) =>
      runFlatFieldMetadataValidator(elementToValidate, validator),
    )
    .filter(isDefined);
