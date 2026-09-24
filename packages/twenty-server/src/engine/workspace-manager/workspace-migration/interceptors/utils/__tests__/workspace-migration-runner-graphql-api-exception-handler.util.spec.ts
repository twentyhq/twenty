import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { workspaceMigrationRunnerGraphqlApiExceptionHandler } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/workspace-migration-runner-graphql-api-exception-handler.util';
import { workspaceMigrationRunnerExceptionFormatter } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-runner-exception-formatter';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

const buildDeferredActionsInProgressException = () =>
  new WorkspaceMigrationRunnerException({
    message: '4 deferred schema action(s) are still running on workspace 2020',
    code: WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
  });

describe('workspaceMigrationRunnerGraphqlApiExceptionHandler', () => {
  it('should turn deferred actions in progress into a conflict carrying its sub code and message', () => {
    const exception = buildDeferredActionsInProgressException();

    expect(() =>
      workspaceMigrationRunnerGraphqlApiExceptionHandler(exception),
    ).toThrowError(
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

  it('should leave other runner exceptions to their caller', () => {
    expect(() =>
      workspaceMigrationRunnerGraphqlApiExceptionHandler(
        new WorkspaceMigrationRunnerException({
          message: 'Application not found',
          code: WorkspaceMigrationRunnerExceptionCode.APPLICATION_NOT_FOUND,
        }),
      ),
    ).not.toThrow();
  });

  it('should leave errors that are not runner exceptions alone', () => {
    expect(() =>
      workspaceMigrationRunnerGraphqlApiExceptionHandler(new Error('Boom')),
    ).not.toThrow();
  });
});

describe('workspaceMigrationRunnerExceptionFormatter', () => {
  it('should format deferred actions in progress as a conflict too', () => {
    expect(() =>
      workspaceMigrationRunnerExceptionFormatter(
        buildDeferredActionsInProgressException(),
      ),
    ).toThrowError(
      expect.objectContaining({
        extensions: expect.objectContaining({
          code: ErrorCode.CONFLICT,
          subCode:
            WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
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
    ).toThrowError(
      expect.objectContaining({
        extensions: expect.objectContaining({
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        }),
      }),
    );
  });
});
