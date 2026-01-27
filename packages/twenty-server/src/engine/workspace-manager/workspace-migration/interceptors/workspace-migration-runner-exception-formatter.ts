import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

export const workspaceMigrationRunnerExceptionFormatter = (
  error: WorkspaceMigrationRunnerException,
) => {
  const isExecutionFailed =
    error.code === WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED;

  throw new BaseGraphQLError(
    error.message,
    isExecutionFailed
      ? ErrorCode.APPLICATION_INSTALLATION_FAILED
      : ErrorCode.INTERNAL_SERVER_ERROR,
    {
      code: error.code,
      ...(isExecutionFailed && {
        action: error.action,
        errors: {
          ...(error.errors?.metadata && {
            metadata: {
              message: error.errors.metadata.message,
              code:
                (error.errors.metadata as { code?: string })?.code ??
                'INTERNAL_SERVER_ERROR',
            },
          }),
          ...(error.errors?.workspaceSchema && {
            workspaceSchema: {
              message: error.errors.workspaceSchema.message,
              code:
                (error.errors.workspaceSchema as { code?: string })?.code ??
                'INTERNAL_SERVER_ERROR',
            },
          }),
        },
      }),
      userFriendlyMessage: error.userFriendlyMessage,
    },
  );
};
