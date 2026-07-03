import { type QueryRunner } from 'typeorm';

import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';

describe('WorkspaceSchemaIndexManagerService', () => {
  let service: WorkspaceSchemaIndexManagerService;
  let queryMock: jest.Mock;
  let queryRunner: QueryRunner;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new WorkspaceSchemaIndexManagerService();
    queryMock = jest.fn();
    queryRunner = { query: queryMock } as unknown as QueryRunner;
  });

  describe('renameIndexWithoutRebuild', () => {
    it('should rename the index with escaped identifiers', async () => {
      await service.renameIndexWithoutRebuild({
        queryRunner,
        schemaName: 'workspace_test',
        fromIndexName: 'IDX_legacy',
        toIndexName: 'IDX_new',
      });

      expect(queryMock).toHaveBeenCalledWith(
        'ALTER INDEX "workspace_test"."IDX_legacy" RENAME TO "IDX_new"',
      );
    });
  });
});
