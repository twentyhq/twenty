import { isDefined } from 'twenty-shared/utils';

import { type FailedFlatObjectMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { runFlatObjectMetadataValidator } from 'src/engine/metadata-modules/flat-object-metadata/utils/run-flat-object-metadata-validator.util';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';

export const runFlatObjectMetadataValidators = <T>(
  elementToValidate: T,
  validators: FlatMetadataValidator<T>[],
): FailedFlatObjectMetadataValidationExceptions[] =>
  validators
    .map((validator) =>
      runFlatObjectMetadataValidator(elementToValidate, validator),
    )
    .filter(isDefined);
