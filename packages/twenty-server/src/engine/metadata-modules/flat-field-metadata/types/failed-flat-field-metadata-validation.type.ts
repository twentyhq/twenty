import { type FieldMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-field-metadata/types/field-metadata-minimal-information.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export type FailedFlatFieldMetadataValidation = {
  type: 'field';
  errors: FlatFieldMetadataValidationError[];
  fieldMinimalInformation: Partial<FieldMetadataMinimalInformation>;
};
