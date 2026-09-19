import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';

export const isUniqueViolation = (error: unknown): boolean =>
  error instanceof QueryFailedError &&
  error.driverError?.code === POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;
