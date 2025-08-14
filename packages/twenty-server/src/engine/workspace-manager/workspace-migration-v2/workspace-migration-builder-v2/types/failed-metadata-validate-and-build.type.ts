import { FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FailedFlatObjectMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';

export type FailedMetadataValidateAndBuild = {
  status: 'failed';
  errors: (
    | FailedFlatFieldMetadataValidationExceptions
    | FailedFlatObjectMetadataValidationExceptions
  )[];
};
