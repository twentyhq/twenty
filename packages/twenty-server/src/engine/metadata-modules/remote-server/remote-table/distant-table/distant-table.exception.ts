import { CustomError } from 'src/utils/custom-error';

export class DistantTableException extends CustomError {
  code: DistantTableExceptionCode;
  constructor(message: string, code: DistantTableExceptionCode) {
    super(message, code);
  }
}

export enum DistantTableExceptionCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}
