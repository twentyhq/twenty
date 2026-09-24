import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { workspaceMigrationRunnerExceptionFormatter } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-runner-exception-formatter';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

describe('workspaceMigrationRunnerExceptionFormatter', () => {
  it('should format deferred actions in progress as a conflict carrying its sub code and message', () => {
    const exception = new WorkspaceMigrationRunnerException({
      message:
        '4 deferred schema action(s) are still running on workspace 2020',
      code: WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
    });

    expect(() => workspaceMigrationRunnerExceptionFormatter(exception)).toThrow(
      expect.objectContaining({
        message: exception.message,
        extensions: expect.objectContaining({
          code: ErrorCode.CONFLICT,
          subCode:
            WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
          userFriendlyMessage: exception.userFriendlyMessage,
        }),
      }),
    );
  });

  it('should keep formatting other runner exceptions as internal server errors', () => {
    expect(() =>
      workspaceMigrationRunnerExceptionFormatter(
        new WorkspaceMigrationRunnerException({
          message: 'Application not found',
          code: WorkspaceMigrationRunnerExceptionCode.APPLICATION_NOT_FOUND,
        }),
      ),
    ).toThrow(
      expect.objectContaining({
        extensions: expect.objectContaining({
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        }),
      }),
    );
  });
});
