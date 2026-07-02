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
    it('should rename with IF EXISTS so a missing source index does not abort the transaction', async () => {
      await service.renameIndexWithoutRebuild({
        queryRunner,
        schemaName: 'workspace_test',
        fromIndexName: 'IDX_legacy',
        toIndexName: 'IDX_new',
      });

      expect(queryMock).toHaveBeenCalledWith(
        'ALTER INDEX IF EXISTS "workspace_test"."IDX_legacy" RENAME TO "IDX_new"',
      );
    });
  });

  describe('doesIndexExist', () => {
    it('should return true when the index exists in the schema', async () => {
      queryMock.mockResolvedValue([{ exists: true }]);

      const result = await service.doesIndexExist({
        queryRunner,
        schemaName: 'workspace_test',
        indexName: 'IDX_existing',
      });

      expect(result).toBe(true);
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining('pg_indexes'),
        ['workspace_test', 'IDX_existing'],
      );
    });

    it('should return false when the index does not exist in the schema', async () => {
      queryMock.mockResolvedValue([{ exists: false }]);

      const result = await service.doesIndexExist({
        queryRunner,
        schemaName: 'workspace_test',
        indexName: 'IDX_missing',
      });

      expect(result).toBe(false);
    });
  });
});
