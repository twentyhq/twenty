import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';

export const isLockNotAvailableError = (error: unknown): boolean =>
  error instanceof QueryFailedError &&
  'code' in error &&
  error.code === POSTGRESQL_ERROR_CODES.LOCK_NOT_AVAILABLE;
