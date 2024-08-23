export enum RefreshAccessTokenErrorCode {
  REFRESH_TOKEN_NOT_FOUND = 'REFRESH_TOKEN_NOT_FOUND',
  REFRESH_ACCESS_TOKEN_FAILED = 'REFRESH_ACCESS_TOKEN_FAILED',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
}

export type RefreshAccessTokenError = {
  code: RefreshAccessTokenErrorCode;
  message: string;
};
