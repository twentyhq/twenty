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

  describe('getIndexDefinition', () => {
    it('should return the index definition when the index exists', async () => {
      const indexDefinition =
        'CREATE UNIQUE INDEX "IDX_existing" ON workspace_test.company USING btree (name)';

      queryMock.mockResolvedValue([{ indexdef: indexDefinition }]);

      const result = await service.getIndexDefinition({
        queryRunner,
        schemaName: 'workspace_test',
        indexName: 'IDX_existing',
      });

      expect(result).toBe(indexDefinition);
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining('pg_indexes'),
        ['workspace_test', 'IDX_existing'],
      );
    });

    it('should return null when the index does not exist', async () => {
      queryMock.mockResolvedValue([]);

      const result = await service.getIndexDefinition({
        queryRunner,
        schemaName: 'workspace_test',
        indexName: 'IDX_missing',
      });

      expect(result).toBeNull();
    });
  });
});
