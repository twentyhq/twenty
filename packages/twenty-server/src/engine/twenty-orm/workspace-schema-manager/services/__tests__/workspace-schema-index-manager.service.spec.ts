import { type QueryRunner } from 'typeorm';

import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';

describe('WorkspaceSchemaIndexManagerService', () => {
  let service: WorkspaceSchemaIndexManagerService;
  let query: jest.Mock;
  let queryRunner: QueryRunner;

  beforeEach(() => {
    service = new WorkspaceSchemaIndexManagerService();
    query = jest.fn();
    queryRunner = {
      query,
      isTransactionActive: true,
    } as unknown as QueryRunner;
  });

  describe('createIndex', () => {
    it('issues a single CREATE INDEX statement', async () => {
      await service.createIndex({
        queryRunner,
        schemaName: 'workspace_1',
        tableName: 'company',
        index: { columns: ['name'], name: 'IDX_company_name', isUnique: false },
      });

      expect(query).toHaveBeenCalledTimes(1);

      const sql = query.mock.calls[0][0] as string;

      expect(sql).toContain('CREATE INDEX IF NOT EXISTS');
      expect(sql).toContain('IDX_company_name');
      expect(sql).not.toContain(';');
    });
  });

  describe('createIndexes', () => {
    it('collapses many indexes into one multi-statement round-trip', async () => {
      await service.createIndexes({
        queryRunner,
        indexes: [
          {
            schemaName: 'workspace_1',
            tableName: 'company',
            index: { columns: ['name'], name: 'IDX_a', isUnique: false },
          },
          {
            schemaName: 'workspace_1',
            tableName: 'person',
            index: { columns: ['email'], name: 'IDX_b', isUnique: true },
          },
        ],
      });

      expect(query).toHaveBeenCalledTimes(1);

      const sql = query.mock.calls[0][0] as string;

      expect(sql).toContain('IDX_a');
      expect(sql).toContain('IDX_b');
      expect(sql).toContain('CREATE UNIQUE INDEX IF NOT EXISTS');
      // Two statements joined by a single ';'
      expect(sql.split(';')).toHaveLength(2);
    });

    it('no-ops on empty input', async () => {
      await service.createIndexes({ queryRunner, indexes: [] });

      expect(query).not.toHaveBeenCalled();
    });
  });
});
