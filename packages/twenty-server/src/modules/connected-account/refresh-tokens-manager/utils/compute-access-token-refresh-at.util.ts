import {
  addMilliseconds,
  differenceInMilliseconds,
  subMilliseconds,
} from 'date-fns';

const DEFAULT_ACCESS_TOKEN_LIFETIME_MS = 60 * 60 * 1000;
const MAX_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const REFRESH_MARGIN_LIFETIME_RATIO = 0.1;

export const computeAccessTokenRefreshAt = ({
  accessTokenIssuedAt,
  accessTokenExpiresAt,
}: {
  accessTokenIssuedAt: Date;
  accessTokenExpiresAt: Date | null;
}): Date => {
  const expiresAt =
    accessTokenExpiresAt ??
    addMilliseconds(accessTokenIssuedAt, DEFAULT_ACCESS_TOKEN_LIFETIME_MS);

  const refreshMarginMs = Math.min(
    MAX_REFRESH_MARGIN_MS,
    differenceInMilliseconds(expiresAt, accessTokenIssuedAt) *
      REFRESH_MARGIN_LIFETIME_RATIO,
  );

  return subMilliseconds(expiresAt, refreshMarginMs);
};
