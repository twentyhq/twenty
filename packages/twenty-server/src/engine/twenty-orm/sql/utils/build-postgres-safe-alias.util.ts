import { createHash } from 'crypto';

// Postgres truncates identifiers at 63 bytes, so two long aliases sharing a
// prefix would collapse onto the same identifier. Hashing past the limit
// mirrors what TypeORM does through DriverUtils.buildAlias.
const POSTGRES_MAX_ALIAS_LENGTH = 63;

export const buildPostgresSafeAlias = (alias: string): string => {
  if (Buffer.byteLength(alias, 'utf8') <= POSTGRES_MAX_ALIAS_LENGTH) {
    return alias;
  }

  return createHash('sha1')
    .update(alias, 'utf8')
    .digest('hex')
    .slice(0, POSTGRES_MAX_ALIAS_LENGTH);
};
