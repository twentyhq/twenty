import { CustomException } from 'src/utils/custom-exception';
import { MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';

export class MessageImportDriverException extends CustomException<
  MessageImportDriverExceptionCode | MessageNetworkExceptionCode
> {}

export enum MessageImportDriverExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
  UNKNOWN_NETWORK_ERROR = 'UNKNOWN_NETWORK_ERROR',
  NO_NEXT_SYNC_CURSOR = 'NO_NEXT_SYNC_CURSOR',
  SYNC_CURSOR_ERROR = 'SYNC_CURSOR_ERROR',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  CLIENT_NOT_AVAILABLE = 'CLIENT_NOT_AVAILABLE',
}
