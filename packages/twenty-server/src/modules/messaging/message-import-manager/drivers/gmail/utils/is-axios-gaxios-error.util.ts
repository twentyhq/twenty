import { GaxiosError } from 'gaxios';

import { MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';

export const isAxiosTemporaryError = (error: GaxiosError): boolean => {
  const { code } = error;

  switch (code) {
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
