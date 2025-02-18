import { CustomException } from 'src/utils/custom-exception';

export class MessageImportException extends CustomException {
  constructor(message: string, code: MessageImportExceptionCode) {
    super(message, code);
  }
}

export enum MessageImportExceptionCode {
  UNKNOWN = 'UNKNOWN',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  MESSAGE_CHANNEL_NOT_FOUND = 'MESSAGE_CHANNEL_NOT_FOUND',
  FOLDER_ID_REQUIRED = 'FOLDER_ID_REQUIRED',
}
