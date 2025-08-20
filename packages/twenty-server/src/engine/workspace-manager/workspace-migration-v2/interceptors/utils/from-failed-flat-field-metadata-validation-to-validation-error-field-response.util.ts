import { FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { ValidationErrorFieldResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/types/validate-error-response.type';

export const fromFailedFlatFieldMetadataValidationToValidationErrorFieldResponse =
  (
    failedFlatFieldMetadataValidation: FailedFlatFieldMetadataValidation,
  ): ValidationErrorFieldResponse => {
    const { id, name, objectMetadataId } =
      failedFlatFieldMetadataValidation.fieldMinimalInformation;
    return {
      id,
      name,
      errors: failedFlatFieldMetadataValidation.errors,
      objectMetadataId,
    };
  };
