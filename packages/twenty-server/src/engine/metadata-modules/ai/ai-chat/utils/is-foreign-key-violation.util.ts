import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';

export const isForeignKeyViolation = (error: unknown): boolean =>
  error instanceof QueryFailedError &&
  error.driverError?.code === POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION;
