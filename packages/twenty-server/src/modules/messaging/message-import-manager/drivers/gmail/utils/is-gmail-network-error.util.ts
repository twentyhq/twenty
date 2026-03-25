import { type GaxiosError } from 'gaxios';

import { MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';

export const isGmailNetworkError = (error: unknown): error is GaxiosError => {
  if (error === null || typeof error !== 'object') {
    return false;
  }

  if (!('code' in error)) {
    return false;
  }

  switch (error.code) {
    case MessageNetworkExceptionCode.ECONNRESET:
    case MessageNetworkExceptionCode.ENOTFOUND:
    case MessageNetworkExceptionCode.ECONNABORTED:
    case MessageNetworkExceptionCode.ETIMEDOUT:
    case MessageNetworkExceptionCode.ERR_NETWORK:
    case MessageNetworkExceptionCode.EHOSTUNREACH:
      return true;
    default:
      return false;
  }
};
