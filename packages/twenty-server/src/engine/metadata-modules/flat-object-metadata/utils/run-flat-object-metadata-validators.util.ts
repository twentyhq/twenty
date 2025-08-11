import { runFlatFieldMetadataValidator } from "src/engine/metadata-modules/flat-field-metadata/utils/run-flat-field-metadata-validator.util";
import { FailedFlatObjectMetadataValidationExceptions } from "src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type";
import { FlatMetadataValidator } from "src/engine/metadata-modules/types/flat-metadata-validator.type";
import { isDefined } from "twenty-shared/utils";

export const runFlatObjectMetadataValidators = <T>(
  elementToValidate: T,
  validators: FlatMetadataValidator<T>[],
): FailedFlatObjectMetadataValidationExceptions[] =>
  validators
    .map((validator) =>
      runFlatFieldMetadataValidator(elementToValidate, validator),
    )
    .filter(isDefined);
