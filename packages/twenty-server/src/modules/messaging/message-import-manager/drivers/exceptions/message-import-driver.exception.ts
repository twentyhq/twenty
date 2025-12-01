import { type MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';

export class MessageImportDriverException extends Error {
  code: MessageImportDriverExceptionCode | MessageNetworkExceptionCode;
  cause?: Error;
  context?: {
    messageChannelId?: string;
    workspaceId?: string;
    syncStep?: string;
  };

  constructor(
    message: string,
    code: MessageImportDriverExceptionCode | MessageNetworkExceptionCode,
    options?: {
      cause?: Error;
      context?: {
        messageChannelId?: string;
        workspaceId?: string;
        syncStep?: string;
      };
    },
  ) {
    super(message);
    this.name = 'MessageImportDriverException';
    this.code = code;
    this.cause = options?.cause;
    this.context = options?.context;

    if (options?.cause?.stack) {
      this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`;
    }
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
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  CLIENT_NOT_AVAILABLE = 'CLIENT_NOT_AVAILABLE',
  ACCESS_TOKEN_MISSING = 'ACCESS_TOKEN_MISSING',
  CHANNEL_MISCONFIGURED = 'CHANNEL_MISCONFIGURED',
}
