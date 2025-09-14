import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type ValidationErrorFieldResponse } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/types/validate-error-response.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const fromFailedFlatFieldMetadataValidationToValidationErrorFieldResponse =
  (
    failedFlatFieldMetadataValidation: FailedFlatEntityValidation<FlatFieldMetadata>,
  ): ValidationErrorFieldResponse => {
    const { id, name, objectMetadataId } =
      failedFlatFieldMetadataValidation.flatEntityMinimalInformation;

    return {
      operation: failedFlatFieldMetadataValidation.type,
      id,
      name,
      errors: failedFlatFieldMetadataValidation.errors,
      objectMetadataId,
    };
  };
