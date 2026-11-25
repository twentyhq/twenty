import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

describe('WorkspaceMigrationRunnerException', () => {
  it('includes the universal identifier of a failed create action in the message', () => {
    const action: AllUniversalWorkspaceMigrationAction = {
      type: 'create',
      metadataName: 'fieldMetadata',
      flatEntity: getFlatFieldMetadataMock({
        universalIdentifier: '20202020-6736-4337-b5c4-8b39fae325a5',
        objectMetadataId: 'object-metadata-id',
        type: FieldMetadataType.TEXT,
      }),
    };

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
    const action: AllUniversalWorkspaceMigrationAction = {
      type: 'delete',
      metadataName: 'pageLayout',
      universalIdentifier: 'uid-page-layout',
    };

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
    const action: AllUniversalWorkspaceMigrationAction = {
      type: 'create',
      metadataName: 'index',
      flatEntity: getFlatIndexMetadataMock({
        universalIdentifier: '9e20a0f6-7a18-51c5-a422-5dc4dbd1d972',
        objectMetadataId: 'object-metadata-id',
        objectMetadataUniversalIdentifier: 'object-metadata-id',
        applicationUniversalIdentifier: 'application',
      }),
    };

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
