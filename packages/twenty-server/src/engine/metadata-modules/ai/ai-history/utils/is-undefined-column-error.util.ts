import { isDefined } from 'twenty-shared/utils';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';

export const isUndefinedColumnError = (error: unknown): boolean => {
  if (!isDefined(error) || typeof error !== 'object') {
    return false;
  }

  if (
    'code' in error &&
    error.code === POSTGRESQL_ERROR_CODES.UNDEFINED_COLUMN
  ) {
    return true;
  }

  return 'cause' in error && isUndefinedColumnError(error.cause);
};
