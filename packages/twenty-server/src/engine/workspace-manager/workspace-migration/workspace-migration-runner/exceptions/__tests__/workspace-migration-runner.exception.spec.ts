import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

describe('WorkspaceMigrationRunnerException', () => {
  it('includes the universal identifier of a failed create action in the message', () => {
    const action = {
      type: 'create',
      metadataName: 'fieldMetadata',
      flatEntity: {
        universalIdentifier: '20202020-6736-4337-b5c4-8b39fae325a5',
      },
    } as unknown as AllUniversalWorkspaceMigrationAction;

    const exception = new WorkspaceMigrationRunnerException({
      code: WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED,
      action,
      errors: {},
    });

    expect(exception.message).toBe(
      "Migration action 'create' for 'fieldMetadata' (universalIdentifier: 20202020-6736-4337-b5c4-8b39fae325a5) failed",
    );
  });

  it('includes the universal identifier of a failed delete action in the message', () => {
    const action = {
      type: 'delete',
      metadataName: 'pageLayout',
      universalIdentifier: 'uid-page-layout',
    } as unknown as AllUniversalWorkspaceMigrationAction;

    const exception = new WorkspaceMigrationRunnerException({
      code: WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED,
      action,
      errors: {},
    });

    expect(exception.message).toBe(
      "Migration action 'delete' for 'pageLayout' (universalIdentifier: uid-page-layout) failed",
    );
  });

  it('includes the underlying execution errors in the message', () => {
    const action = {
      type: 'create',
      metadataName: 'index',
      flatEntity: {
        universalIdentifier: '9e20a0f6-7a18-51c5-a422-5dc4dbd1d972',
      },
    } as unknown as AllUniversalWorkspaceMigrationAction;

    const exception = new WorkspaceMigrationRunnerException({
      code: WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED,
      action,
      errors: {
        workspaceSchema: new Error('relation "IDX_abc" already exists'),
      },
    });

    expect(exception.message).toBe(
      "Migration action 'create' for 'index' (universalIdentifier: 9e20a0f6-7a18-51c5-a422-5dc4dbd1d972) failed: [workspaceSchema] relation \"IDX_abc\" already exists",
    );
  });
});
