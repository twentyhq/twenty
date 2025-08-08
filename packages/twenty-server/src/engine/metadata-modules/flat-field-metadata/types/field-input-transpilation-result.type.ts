import { type FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';

export type FailedFieldInputTranspilation = {
  status: 'fail';
  error: FailedFlatFieldMetadataValidationExceptions;
};
export type SuccessfulFieldInputTranspilation<T> = {
  status: 'success';
  result: T;
};
export type FieldInputTranspilationResult<T> =
  | FailedFieldInputTranspilation
  | SuccessfulFieldInputTranspilation<T>;
