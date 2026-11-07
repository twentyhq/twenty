import { isObject } from '@sniptt/guards';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/workspace-query-executor/constants/postgres-error-codes.constants';

const hasLockNotAvailableCode = (error: unknown): boolean =>
  isObject(error) &&
  'code' in error &&
  error.code === POSTGRESQL_ERROR_CODES.LOCK_NOT_AVAILABLE;

export const isLockNotAvailableError = (error: unknown): boolean =>
  hasLockNotAvailableCode(error) ||
  (isObject(error) && 'cause' in error && hasLockNotAvailableCode(error.cause));
