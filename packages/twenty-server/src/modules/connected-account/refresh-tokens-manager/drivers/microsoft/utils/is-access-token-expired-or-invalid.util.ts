import { isNonEmptyString } from '@sniptt/guards';
import jwt from 'jsonwebtoken';

export const isAccessTokenExpiredOrInvalid = (
  token: string,
  expirationBufferInSeconds = 5 * 60,
): boolean => {
  if (!isNonEmptyString(token)) {
    return true;
  }

  try {
    const payload = jwt.decode(token) as { exp?: number } | null;

    if (!payload || typeof payload.exp !== 'number') {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp < currentTime + expirationBufferInSeconds;
  } catch {
    return true;
  }
};
