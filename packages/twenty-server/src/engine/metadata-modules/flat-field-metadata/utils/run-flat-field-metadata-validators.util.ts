import { isDefined } from 'twenty-shared/utils';

import { type FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { runFlatFieldMetadataValidator } from 'src/engine/metadata-modules/flat-field-metadata/utils/run-flat-field-metadata-validator.util';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';

export const runFlatFieldMetadataValidators = <T>(
  elementToValidate: T,
  validators: FlatMetadataValidator<T>[],
): FailedFlatFieldMetadataValidationExceptions[] =>
  validators
    .map((validator) =>
      runFlatFieldMetadataValidator(elementToValidate, validator),
    )
    .filter(isDefined);
