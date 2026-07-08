export class MessageOutboundDriverException extends Error {
  code: MessageOutboundDriverExceptionCode;

  constructor(message: string, code: MessageOutboundDriverExceptionCode) {
    super(message);
    this.name = 'MessageOutboundDriverException';
    this.code = code;
  }
}

export enum MessageOutboundDriverExceptionCode {
  CONNECTION_PROVIDER_NOT_FOUND = 'CONNECTION_PROVIDER_NOT_FOUND',
  CHANNEL_MISCONFIGURED = 'CHANNEL_MISCONFIGURED',
  SEND_MESSAGE_FUNCTION_NOT_FOUND = 'SEND_MESSAGE_FUNCTION_NOT_FOUND',
  SEND_MESSAGE_FUNCTION_FAILED = 'SEND_MESSAGE_FUNCTION_FAILED',
  INVALID_SEND_MESSAGE_FUNCTION_RESULT = 'INVALID_SEND_MESSAGE_FUNCTION_RESULT',
  DRAFTS_NOT_SUPPORTED = 'DRAFTS_NOT_SUPPORTED',
}
