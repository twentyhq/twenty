import { CustomException } from 'src/utils/custom-exception';

export class MessageImportException extends CustomException<MessageImportExceptionCode> {}

export enum MessageImportExceptionCode {
  UNKNOWN = 'UNKNOWN',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
}
