import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class WorkspaceMigrationRunnerException extends CustomException<
  keyof typeof WorkspaceMigrationRunnerExceptionCode
> {}

export const WorkspaceMigrationRunnerExceptionCode = appendCommonExceptionCode({
  FIELD_METADATA_NOT_FOUND: 'FIELD_METADATA_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND: 'OBJECT_METADATA_NOT_FOUND',
  ENUM_OPERATION_FAILED: 'ENUM_OPERATION_FAILED',
  UNSUPPORTED_COMPOSITE_COLUMN_TYPE: 'UNSUPPORTED_COMPOSITE_COLUMN_TYPE',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  INVALID_ACTION_TYPE: 'INVALID_ACTION_TYPE',
  FLAT_ENTITY_NOT_FOUND: 'FLAT_ENTITY_NOT_FOUND'
} as const);
