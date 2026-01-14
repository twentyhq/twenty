import { isDefined } from 'twenty-shared/utils';

const TIMEOUT_ERROR_CODES = [
  'ETIMEOUT',
  'UPGRADE_TIMEOUT',
  'CONNECT_TIMEOUT',
  'GREETING_TIMEOUT',
];

const CONNECTION_ERROR_CODES = [
  'NoConnection',
  'EConnectionClosed',
  'ProxyError',
  'ClosedAfterConnectTLS',
  'ClosedAfterConnectText',
  'ECONNREFUSED',
];

export const isImapNetworkError = (error: Error): boolean => {
  const errorWithCode = error as { code?: string };

  if (
    isDefined(errorWithCode.code) &&
    TIMEOUT_ERROR_CODES.includes(errorWithCode.code)
  ) {
    return true;
  }

  if (
    isDefined(errorWithCode.code) &&
    CONNECTION_ERROR_CODES.includes(errorWithCode.code)
  ) {
    return true;
  }

  return false;
};
