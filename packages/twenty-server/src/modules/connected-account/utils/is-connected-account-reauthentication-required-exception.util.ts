import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';

// Those codes mean the stored credentials are dead until the user reconnects
// the account, so retrying the operation can never succeed.
const REAUTHENTICATION_REQUIRED_CODES: string[] = [
  ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
  ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
];

export const isConnectedAccountReauthenticationRequiredException = (
  error: unknown,
): error is ConnectedAccountRefreshAccessTokenException =>
  error instanceof ConnectedAccountRefreshAccessTokenException &&
  REAUTHENTICATION_REQUIRED_CODES.includes(error.code);
