import { FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { ObjectMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-object-metadata/types/object-metadata-minimal-information.type';

export type FailedFlatObjectMetadataValidation = {
  type: 'object';
  objectLevelErrors: FlatObjectMetadataValidationError[];
  fieldLevelErrors: FailedFlatFieldMetadataValidation[];
  objectMinimalInformation: Partial<ObjectMetadataMinimalInformation>;
};
