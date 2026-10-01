import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { isDuplicateEntryError } from 'src/engine/twenty-orm/utils/is-duplicate-entry-error.util';

export const isUniqueViolationError = (error: unknown): boolean =>
  isDuplicateEntryError(error) ||
  (error instanceof QueryFailedError &&
    (error as QueryFailedError & { code?: string }).code ===
      POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION);
