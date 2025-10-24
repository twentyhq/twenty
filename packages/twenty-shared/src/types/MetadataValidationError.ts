export type TranslatedFlatEntityValidationError<TCode extends string = string> =
  {
    code: TCode;
    message: string;
    userFriendlyMessage?: string;
    value?: unknown;
  };

export type ValidationErrorFieldInfo = {
  id?: string;
  name?: string;
  label?: string;
  type?: string;
};

export type ValidationErrorFieldResponse = ValidationErrorFieldInfo & {
  operation: 'created' | 'updated' | 'deleted';
  errors: TranslatedFlatEntityValidationError[];
};

export type ValidationErrorObjectInfo = {
  id?: string;
  nameSingular?: string;
  namePlural?: string;
  labelSingular?: string;
  labelPlural?: string;
};

export type ValidationErrorObjectResponse = ValidationErrorObjectInfo & {
  operation: 'created' | 'updated' | 'deleted';
  errors: TranslatedFlatEntityValidationError[];
  fields: ValidationErrorFieldResponse[];
};

export type ValidationErrorGenericResponse = {
  id?: string;
  name?: string;
  operation: 'created' | 'updated' | 'deleted';
  errors: TranslatedFlatEntityValidationError[];
};

export type OrchestratorFailureReport = {
  objectMetadata: ValidationErrorObjectResponse[];
  fieldMetadata: ValidationErrorFieldResponse[];
  view: ValidationErrorGenericResponse[];
  viewField: ValidationErrorGenericResponse[];
  viewGroup: ValidationErrorGenericResponse[];
  viewFilter: ValidationErrorGenericResponse[];
  index: ValidationErrorGenericResponse[];
  serverlessFunction: ValidationErrorGenericResponse[];
  cronTrigger: ValidationErrorGenericResponse[];
  databaseEventTrigger: ValidationErrorGenericResponse[];
  routeTrigger: ValidationErrorGenericResponse[];
};

export type ValidationErrorSummary = {
  totalErrors: number;
  invalidObjectMetadata: number;
  invalidFieldMetadata: number;
  invalidView: number;
  invalidViewField: number;
  invalidViewGroup: number;
  invalidViewFilter: number;
  invalidIndex: number;
  invalidServerlessFunction: number;
  invalidCronTrigger: number;
  invalidDatabaseEventTrigger: number;
  invalidRouteTrigger: number;
};

export type ValidationErrorResponse = {
  summary: ValidationErrorSummary;
  errors: OrchestratorFailureReport;
};

export type MetadataValidationErrorExtensions = {
  code: 'METADATA_VALIDATION_FAILED';
  errors: OrchestratorFailureReport;
  summary: ValidationErrorSummary;
  message: string;
  userFriendlyMessage?: string;
};

export type MetadataEntityType = keyof OrchestratorFailureReport;

export enum MetadataInternalErrorCode {
  BUILDER_INTERNAL_SERVER_ERROR = 'BUILDER_INTERNAL_SERVER_ERROR',
  RUNNER_INTERNAL_SERVER_ERROR = 'RUNNER_INTERNAL_SERVER_ERROR',
}

