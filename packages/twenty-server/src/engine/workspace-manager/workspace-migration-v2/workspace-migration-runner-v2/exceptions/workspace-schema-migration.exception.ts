import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceSchemaMigrationException extends CustomException<WorkspaceSchemaMigrationExceptionCode> {}

export enum WorkspaceSchemaMigrationExceptionCode {
  ENUM_OPERATION_FAILED = 'ENUM_OPERATION_FAILED',
  UNSUPPORTED_COMPOSITE_COLUMN_TYPE = 'UNSUPPORTED_COMPOSITE_COLUMN_TYPE',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  INVALID_ACTION_TYPE = 'INVALID_ACTION_TYPE',
}
