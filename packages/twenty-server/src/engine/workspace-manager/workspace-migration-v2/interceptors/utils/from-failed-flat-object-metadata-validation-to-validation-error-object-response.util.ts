import { type FailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { type ValidationErrorObjectResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/types/validate-error-response.type';
import { fromFailedFlatFieldMetadataValidationToValidationErrorFieldResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/from-failed-flat-field-metadata-validation-to-validation-error-field-response.util';

export const fromFailedFlatObjectMetadataValidationToValidationErrorObjectResponse =
  (
    failedFlatObjectMetadataValidation: FailedFlatObjectMetadataValidation,
  ): ValidationErrorObjectResponse => {
    const { id, namePlural, nameSingular } =
      failedFlatObjectMetadataValidation.objectMinimalInformation;
    const fields = failedFlatObjectMetadataValidation.fieldLevelErrors.map(
      fromFailedFlatFieldMetadataValidationToValidationErrorFieldResponse,
    );
    const objectResponseError: ValidationErrorObjectResponse = {
      operation: failedFlatObjectMetadataValidation.type,
      fields,
      id,
      namePlural,
      nameSingular,
      errors: failedFlatObjectMetadataValidation.objectLevelErrors,
    };

    return objectResponseError;
  };
