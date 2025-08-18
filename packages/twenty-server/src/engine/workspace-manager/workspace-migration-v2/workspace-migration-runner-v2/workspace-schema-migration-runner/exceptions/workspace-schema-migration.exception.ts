import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceSchemaMigrationException extends CustomException<WorkspaceSchemaMigrationExceptionCode> {}

export enum WorkspaceSchemaMigrationExceptionCode {
  COMPOSITE_TYPE_NOT_FOUND = 'COMPOSITE_TYPE_NOT_FOUND',
  INVALID_FIELD_TYPE = 'INVALID_FIELD_TYPE',
  ENUM_OPERATION_FAILED = 'ENUM_OPERATION_FAILED',
  COLUMN_OPERATION_FAILED = 'COLUMN_OPERATION_FAILED',
  TABLE_OPERATION_FAILED = 'TABLE_OPERATION_FAILED',
  UNSUPPORTED_COMPOSITE_COLUMN_TYPE = 'UNSUPPORTED_COMPOSITE_COLUMN_TYPE',
}
