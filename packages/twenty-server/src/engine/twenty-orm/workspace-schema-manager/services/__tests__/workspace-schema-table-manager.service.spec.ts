import { type QueryRunner } from 'typeorm';

import { WorkspaceSchemaTableManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-table-manager.service';

describe('WorkspaceSchemaTableManagerService', () => {
  let service: WorkspaceSchemaTableManagerService;
  let query: jest.Mock;
  let queryRunner: QueryRunner;

  beforeEach(() => {
    service = new WorkspaceSchemaTableManagerService();
    query = jest.fn();
    queryRunner = {
      query,
      isTransactionActive: true,
    } as unknown as QueryRunner;
  });

  describe('createTable', () => {
    it('issues a single CREATE TABLE statement', async () => {
      await service.createTable({
        queryRunner,
        schemaName: 'workspace_1',
        tableName: 'company',
      });

      expect(query).toHaveBeenCalledTimes(1);

      const sql = query.mock.calls[0][0] as string;

      expect(sql).toContain('CREATE TABLE IF NOT EXISTS');
      expect(sql).toContain('company');
      expect(sql).not.toContain(';');
    });
  });

  describe('createTables', () => {
    it('collapses many tables into one multi-statement round-trip', async () => {
      await service.createTables({
        queryRunner,
        schemaName: 'workspace_1',
        tables: [{ tableName: 'company' }, { tableName: 'person' }],
      });

      expect(query).toHaveBeenCalledTimes(1);

      const sql = query.mock.calls[0][0] as string;

      expect(sql).toContain('company');
      expect(sql).toContain('person');
      // Two statements joined by a single ';'
      expect(sql.split(';')).toHaveLength(2);
      // Each table with no columns still gets the default primary key.
      expect(sql).toContain('"id" uuid PRIMARY KEY DEFAULT gen_random_uuid()');
    });

    it('no-ops on empty input', async () => {
      await service.createTables({
        queryRunner,
        schemaName: 'workspace_1',
        tables: [],
      });

      expect(query).not.toHaveBeenCalled();
    });
  });
});
