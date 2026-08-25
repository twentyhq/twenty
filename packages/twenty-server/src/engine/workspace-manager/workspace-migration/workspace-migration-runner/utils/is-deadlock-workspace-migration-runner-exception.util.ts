import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

const isPostgresDeadlockError = (error: Error | undefined): boolean =>
  error instanceof QueryFailedError &&
  (error.driverError as { code?: string } | undefined)?.code ===
    POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED;

export const isDeadlockWorkspaceMigrationRunnerException = (
  error: unknown,
): boolean =>
  error instanceof WorkspaceMigrationRunnerException &&
  [error.errors?.metadata, error.errors?.workspaceSchema].some(
    isPostgresDeadlockError,
  );
