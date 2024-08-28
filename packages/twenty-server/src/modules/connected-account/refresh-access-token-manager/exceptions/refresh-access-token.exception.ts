import { CustomException } from 'src/utils/custom-exception';

export class RefreshAccessTokenException extends CustomException {
  code: RefreshAccessTokenExceptionCode;
  constructor(message: string, code: RefreshAccessTokenExceptionCode) {
    super(message, code);
  }
}

export enum RefreshAccessTokenExceptionCode {
  REFRESH_TOKEN_NOT_FOUND = 'REFRESH_TOKEN_NOT_FOUND',
  REFRESH_ACCESS_TOKEN_FAILED = 'REFRESH_ACCESS_TOKEN_FAILED',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
}
