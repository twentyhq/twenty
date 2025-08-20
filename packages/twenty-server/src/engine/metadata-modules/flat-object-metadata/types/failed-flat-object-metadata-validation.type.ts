import { FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { ObjectMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-object-metadata/types/object-metadata-minimal-information.type';

export type FailedFlatObjectMetadataValidation = {
  type: 'object';
  errors: (
    | FlatObjectMetadataValidationError
    | FlatFieldMetadataValidationError
  )[];
  objectMinimalInformation: Partial<ObjectMetadataMinimalInformation>;
};
