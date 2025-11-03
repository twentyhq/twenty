import { type FlatViewFieldValidationError } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-validation-error.type';

// TODO centralize this file prastoin
export type FailedViewFieldInputTranspilation = {
  status: 'fail';
  error: FlatViewFieldValidationError;
};

export type SuccessfulViewFieldInputTranspilation<T> = {
  status: 'success';
  result: T;
};

export type ViewFieldInputTranspilationResult<T> =
  | FailedViewFieldInputTranspilation
  | SuccessfulViewFieldInputTranspilation<T>;

