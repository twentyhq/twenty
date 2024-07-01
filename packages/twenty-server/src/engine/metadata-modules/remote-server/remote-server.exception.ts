import { CustomException } from 'src/utils/custom-exception';

export class RemoteServerException extends CustomException {
  code: RemoteServerExceptionCode;
  constructor(message: string, code: RemoteServerExceptionCode) {
    super(message, code);
  }
}

export enum RemoteServerExceptionCode {
  REMOTE_SERVER_NOT_FOUND = 'REMOTE_SERVER_NOT_FOUND',
  REMOTE_SERVER_ALREADY_EXISTS = 'REMOTE_SERVER_ALREADY_EXISTS',
  REMOTE_SERVER_MUTATION_NOT_ALLOWED = 'REMOTE_SERVER_MUTATION_NOT_ALLOWED',
  REMOTE_SERVER_CONNECTION_ERROR = 'REMOTE_SERVER_CONNECTION_ERROR',
  INVALID_REMOTE_SERVER_INPUT = 'INVALID_REMOTE_SERVER_INPUT',
}
