import { CustomError } from 'src/utils/custom-error';

export class WorkspaceMigrationException extends CustomError {
  code: WorkspaceMigrationExceptionCode;
  constructor(message: string, code: WorkspaceMigrationExceptionCode) {
    super(message, code);
  }
}

export enum WorkspaceMigrationExceptionCode {
  NO_FACTORY_FOUND = 'NO_FACTORY_FOUND',
  INVALID_ACTION = 'INVALID_ACTION',
  INVALID_FIELD_METADATA = 'INVALID_FIELD_METADATA',
}
