import { type FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { type ValidationErrorFieldResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/types/validate-error-response.type';

export const fromFailedFlatFieldMetadataValidationToValidationErrorFieldResponse =
  (
    failedFlatFieldMetadataValidation: FailedFlatFieldMetadataValidation,
  ): ValidationErrorFieldResponse => {
    const { id, name, objectMetadataId } =
      failedFlatFieldMetadataValidation.fieldMinimalInformation;

    return {
      operation: failedFlatFieldMetadataValidation.type,
      id,
      name,
      errors: failedFlatFieldMetadataValidation.errors,
      objectMetadataId,
    };
  };
