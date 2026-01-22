import { msg } from '@lingui/core/macro';

import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type WorkspaceMigrationActionExecutionException,
  WorkspaceMigrationActionExecutionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-action-execution.exception';
import { type WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

export const workspaceMigrationActionExecutionExceptionFormatter = (
  error: WorkspaceMigrationActionExecutionException,
) => {
  throw new BaseGraphQLError(
    error.message,
    ErrorCode.APPLICATION_INSTALLATION_FAILED,
    {
      code: WorkspaceMigrationActionExecutionExceptionCode.EXECUTION_FAILED,
      action: error.action,
      errors: {
        ...(error.errors.metadata && {
          metadata: {
            message: error.errors.metadata.message,
            code: (error.errors.metadata as { code?: string })?.code,
          },
        }),
        ...(error.errors.workspaceSchema && {
          workspaceSchema: {
            message: error.errors.workspaceSchema.message,
            code: (error.errors.workspaceSchema as { code?: string })?.code,
          },
        }),
      },
      userFriendlyMessage: msg`Application installation failed`,
    },
  );
};

export const workspaceMigrationRunnerExceptionFormatter = (
  error: WorkspaceMigrationRunnerException,
) => {
  throw new BaseGraphQLError(error.message, ErrorCode.INTERNAL_SERVER_ERROR, {
    code: error.code,
    userFriendlyMessage: error.userFriendlyMessage,
  });
};
