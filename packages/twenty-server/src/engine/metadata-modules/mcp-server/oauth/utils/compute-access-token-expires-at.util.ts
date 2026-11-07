import { isDefined } from 'twenty-shared/utils';

export const computeAccessTokenExpiresAt = ({
  expiresInSeconds,
  now,
}: {
  expiresInSeconds: number | undefined;
  now: Date;
}): Date | null =>
  isDefined(expiresInSeconds)
    ? new Date(now.getTime() + expiresInSeconds * 1000)
    : null;
