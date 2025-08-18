import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceMigrationV2Exception extends CustomException<WorkspaceMigrationV2ExceptionCode> {}

export enum WorkspaceMigrationV2ExceptionCode {
  BUILDER_INTERNAL_SERVER_ERROR = 'BUILDER_INTERNAL_SERVER_ERROR',
  RUNNER_INTERNAL_SERVER_ERROR = 'RUNNER_INTERNAL_SERVER_ERROR',
}
