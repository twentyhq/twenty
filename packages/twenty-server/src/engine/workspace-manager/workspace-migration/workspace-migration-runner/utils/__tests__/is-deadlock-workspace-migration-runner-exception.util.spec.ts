import { QueryFailedError } from 'typeorm';

import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
  type WorkspaceMigrationRunnerExecutionErrors,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import { isDeadlockWorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/is-deadlock-workspace-migration-runner-exception.util';

const buildQueryFailedError = (code: string): QueryFailedError => {
  const driverError = new Error('deadlock detected');

  Object.assign(driverError, { code });

  return new QueryFailedError('DROP INDEX "IDX_abc"', [], driverError);
};

const buildExecutionFailedException = (
  errors: WorkspaceMigrationRunnerExecutionErrors,
): WorkspaceMigrationRunnerException =>
  new WorkspaceMigrationRunnerException({
    action: {
      type: 'delete',
      metadataName: 'index',
      universalIdentifier: '20202020-0000-4000-8000-000000000001',
    } as AllUniversalWorkspaceMigrationAction,
    errors,
    code: WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED,
  });

describe('isDeadlockWorkspaceMigrationRunnerException', () => {
  it('returns true when the workspace schema error is a postgres deadlock', () => {
    expect(
      isDeadlockWorkspaceMigrationRunnerException(
        buildExecutionFailedException({
          workspaceSchema: buildQueryFailedError('40P01'),
        }),
      ),
    ).toBe(true);
  });

  it('returns true when the metadata error is a postgres deadlock', () => {
    expect(
      isDeadlockWorkspaceMigrationRunnerException(
        buildExecutionFailedException({
          metadata: buildQueryFailedError('40P01'),
        }),
      ),
    ).toBe(true);
  });

  it('returns false for other postgres errors', () => {
    expect(
      isDeadlockWorkspaceMigrationRunnerException(
        buildExecutionFailedException({
          workspaceSchema: buildQueryFailedError('42P07'),
        }),
      ),
    ).toBe(false);
  });

  it('returns false for plain errors', () => {
    expect(
      isDeadlockWorkspaceMigrationRunnerException(
        buildExecutionFailedException({
          workspaceSchema: new Error('deadlock detected'),
        }),
      ),
    ).toBe(false);
  });

  it('returns false for runner exceptions without execution errors', () => {
    expect(
      isDeadlockWorkspaceMigrationRunnerException(
        new WorkspaceMigrationRunnerException({
          message: 'deadlock detected',
          code: WorkspaceMigrationRunnerExceptionCode.INTERNAL_SERVER_ERROR,
        }),
      ),
    ).toBe(false);
  });

  it('returns false for non runner exceptions', () => {
    expect(
      isDeadlockWorkspaceMigrationRunnerException(
        buildQueryFailedError('40P01'),
      ),
    ).toBe(false);
  });
});
