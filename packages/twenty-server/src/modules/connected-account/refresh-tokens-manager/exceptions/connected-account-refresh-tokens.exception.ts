import { CustomException } from 'src/utils/custom-exception';

export class ConnectedAccountRefreshAccessTokenException extends CustomException {
  constructor(
    message: string,
    code: ConnectedAccountRefreshAccessTokenExceptionCode,
  ) {
    super(message, code);
  }
}

export enum ConnectedAccountRefreshAccessTokenExceptionCode {
  REFRESH_TOKEN_NOT_FOUND = 'REFRESH_TOKEN_NOT_FOUND',
  REFRESH_ACCESS_TOKEN_FAILED = 'REFRESH_ACCESS_TOKEN_FAILED',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
}
