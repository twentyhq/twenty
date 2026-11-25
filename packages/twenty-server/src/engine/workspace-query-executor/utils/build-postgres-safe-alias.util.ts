import { createHash } from 'crypto';

// Postgres truncates past 63 bytes, which would merge aliases sharing a prefix
const POSTGRES_MAX_ALIAS_LENGTH = 63;

export const buildPostgresSafeAlias = (alias: string): string => {
  if (Buffer.byteLength(alias, 'utf8') <= POSTGRES_MAX_ALIAS_LENGTH) {
    return alias;
  }

  return createHash('sha256')
    .update(alias, 'utf8')
    .digest('hex')
    .slice(0, POSTGRES_MAX_ALIAS_LENGTH);
};
