import { msg } from '@lingui/core/macro';

import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceMigrationExecutionException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-execution.exception';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

export const workspaceMigrationExecutionExceptionFormatter = (
  error: WorkspaceMigrationExecutionException,
) => {
  throw new BaseGraphQLError(error.message, ErrorCode.INTERNAL_SERVER_ERROR, {
    code: 'MIGRATION_EXECUTION_ERROR',
    action: error.action,
    errors: {
      ...(error.errors.metadata && {
        metadata: {
          message: error.errors.metadata.message,
          stack: error.errors.metadata.stack,
        },
      }),
      ...(error.errors.workspaceSchema && {
        workspaceSchema: {
          message: error.errors.workspaceSchema.message,
          stack: error.errors.workspaceSchema.stack,
        },
      }),
    },
    userFriendlyMessage: msg`Migration execution failed`,
  });
};

export const workspaceMigrationRunnerExceptionFormatter = (
  error: WorkspaceMigrationRunnerException,
) => {
  throw new BaseGraphQLError(error.message, ErrorCode.INTERNAL_SERVER_ERROR, {
    code: error.code,
    userFriendlyMessage: error.userFriendlyMessage,
  });
};
