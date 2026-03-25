import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export type FailedFieldInputTranspilation = {
  status: 'fail';
  errors: FlatFieldMetadataValidationError[];
};
export type SuccessfulFieldInputTranspilation<T> = {
  status: 'success';
  result: T;
};
export type FieldInputTranspilationResult<T> =
  | FailedFieldInputTranspilation
  | SuccessfulFieldInputTranspilation<T>;
