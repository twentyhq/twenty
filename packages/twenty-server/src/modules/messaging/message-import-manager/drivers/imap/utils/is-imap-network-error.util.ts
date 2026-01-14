import { isDefined } from 'twenty-shared/utils';

import { MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';

const IMAPFLOW_TIMEOUT_ERROR_CODES = [
  'ETIMEOUT',
  'UPGRADE_TIMEOUT',
  'CONNECT_TIMEOUT',
  'GREETING_TIMEOUT',
];

const IMAPFLOW_CONNECTION_ERROR_CODES = [
  'NoConnection',
  'EConnectionClosed',
  'ProxyError',
  'ClosedAfterConnectTLS',
  'ClosedAfterConnectText',
];

const NODEJS_NETWORK_ERROR_CODES = [
  MessageNetworkExceptionCode.ECONNREFUSED,
  MessageNetworkExceptionCode.ECONNRESET,
  MessageNetworkExceptionCode.ENOTFOUND,
  MessageNetworkExceptionCode.ECONNABORTED,
  MessageNetworkExceptionCode.ETIMEDOUT,
  MessageNetworkExceptionCode.ERR_NETWORK,
  MessageNetworkExceptionCode.EHOSTUNREACH,
];

export const isImapNetworkError = (error: Error): boolean => {
  const errorWithCode = error as { code?: string };

  if (!isDefined(errorWithCode.code)) {
    return false;
  }

  if (IMAPFLOW_TIMEOUT_ERROR_CODES.includes(errorWithCode.code)) {
    return true;
  }

  if (IMAPFLOW_CONNECTION_ERROR_CODES.includes(errorWithCode.code)) {
    return true;
  }

  if (
    NODEJS_NETWORK_ERROR_CODES.includes(
      errorWithCode.code as MessageNetworkExceptionCode,
    )
  ) {
    return true;
  }

  return false;
};
