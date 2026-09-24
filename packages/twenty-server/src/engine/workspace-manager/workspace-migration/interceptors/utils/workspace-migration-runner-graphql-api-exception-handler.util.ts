import { ConflictError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

export const workspaceMigrationRunnerGraphqlApiExceptionHandler = (
  error: unknown,
) => {
  if (
    error instanceof WorkspaceMigrationRunnerException &&
    error.code ===
      WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS
  ) {
    throw new ConflictError(error.message, {
      subCode: error.code,
      userFriendlyMessage: error.userFriendlyMessage,
    });
  }
};
