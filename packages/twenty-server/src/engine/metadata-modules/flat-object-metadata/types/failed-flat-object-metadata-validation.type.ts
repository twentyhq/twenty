import { type FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type ObjectMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-object-metadata/types/object-metadata-minimal-information.type';

export type FailedFlatObjectMetadataValidation = {
  type: 'object';
  objectLevelErrors: FlatObjectMetadataValidationError[];
  fieldLevelErrors: FailedFlatFieldMetadataValidation[];
  objectMinimalInformation: Partial<ObjectMetadataMinimalInformation>;
};
