import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ValidationErrorObjectResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/types/validate-error-response.type';
import { fromFailedFlatFieldMetadataValidationToValidationErrorFieldResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/from-failed-flat-field-metadata-validation-to-validation-error-field-response.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const fromFailedFlatObjectMetadataValidationToValidationErrorObjectResponse =
  (
    failedFlatObjectMetadataValidation: FailedFlatEntityValidation<FlatObjectMetadata>,
  ): ValidationErrorObjectResponse => {
    const { id, namePlural, nameSingular } =
      failedFlatObjectMetadataValidation.flatEntityMinimalInformation;
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
