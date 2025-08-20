import { type FieldMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-field-metadata/types/field-metadata-minimal-information.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type ObjectMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-object-metadata/types/object-metadata-minimal-information.type';

export type ValidationErrorFieldResponse =
  Partial<FieldMetadataMinimalInformation> & {
    errors: FlatFieldMetadataValidationError[];
  };
export type ValidationErrorObjectResponse =
  Partial<ObjectMetadataMinimalInformation> & {
    errors: FlatObjectMetadataValidationError[];
    fields: ValidationErrorFieldResponse[];
  };
export type ValidationErrorResponse = {
  summary: {
    totalErrors: number;
    invalidFields: number;
    invalidObjects: number;
  };
  errors: {
    objectMetadata: ValidationErrorObjectResponse[];
    fieldMetadata: ValidationErrorFieldResponse[];
  };
};
