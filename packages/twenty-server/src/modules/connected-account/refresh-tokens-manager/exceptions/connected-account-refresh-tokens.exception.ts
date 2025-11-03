import { CustomException } from 'src/utils/custom-exception';

export class ConnectedAccountRefreshAccessTokenException extends CustomException<ConnectedAccountRefreshAccessTokenExceptionCode> {}

export enum ConnectedAccountRefreshAccessTokenExceptionCode {
  REFRESH_TOKEN_NOT_FOUND = 'REFRESH_TOKEN_NOT_FOUND',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  REFRESH_ACCESS_TOKEN_FAILED = 'REFRESH_ACCESS_TOKEN_FAILED',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  TEMPORARY_NETWORK_ERROR = 'TEMPORARY_NETWORK_ERROR',
}
