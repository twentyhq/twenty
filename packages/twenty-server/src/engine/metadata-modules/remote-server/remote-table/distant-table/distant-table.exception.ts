import { CustomException } from 'src/utils/custom-exception';

export class DistantTableException extends CustomException {
  code: DistantTableExceptionCode;
  constructor(message: string, code: DistantTableExceptionCode) {
    super(message, code);
  }
}

export enum DistantTableExceptionCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}
