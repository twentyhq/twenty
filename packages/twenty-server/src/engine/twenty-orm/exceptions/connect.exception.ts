import { CustomException } from 'src/utils/custom-exception';

export class ConnectException extends CustomException {
  declare code: ConnectExceptionCode;
  constructor(
    message: string,
    code: ConnectExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum ConnectExceptionCode {
  RECORD_TO_CONNECT_NOT_FOUND = 'RECORD_TO_CONNECT_NOT_FOUND',
  TARGET_OBJECT_METADATA_NOT_FOUND = 'TARGET_OBJECT_METADATA_NOT_FOUND',
  CONNECT_NOT_ALLOWED = 'CONNECT_NOT_ALLOWED',
  UNIQUE_CONSTRAINT_ERROR = 'UNIQUE_CONSTRAINT_ERROR',
}
