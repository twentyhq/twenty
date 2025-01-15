import { CustomException } from 'src/utils/custom-exception';

export class MessageImportDriverException extends CustomException {
  code: MessageImportDriverExceptionCode;
  constructor(message: string, code: MessageImportDriverExceptionCode) {
    super(message, code);
  }
}

export enum MessageImportDriverExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
  UNKNOWN_NETWORK_ERROR = 'UNKNOWN_NETWORK_ERROR',
  NO_NEXT_SYNC_CURSOR = 'NO_NEXT_SYNC_CURSOR',
  SYNC_CURSOR_ERROR = 'SYNC_CURSOR_ERROR',
}
