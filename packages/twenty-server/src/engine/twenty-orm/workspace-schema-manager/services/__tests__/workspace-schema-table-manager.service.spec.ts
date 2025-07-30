import { Test, TestingModule } from '@nestjs/testing';

import { QueryRunner } from 'typeorm';

import { WorkspaceSchemaTableManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-table-manager.service';

describe('WorkspaceSchemaTableManager', () => {
  let service: WorkspaceSchemaTableManagerService;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    mockQueryRunner = {
      query: jest.fn().mockResolvedValue([]),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceSchemaTableManagerService],
    }).compile();

    service = module.get<WorkspaceSchemaTableManagerService>(
      WorkspaceSchemaTableManagerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTable', () => {
    it('should create table with default columns when no columns provided', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';

      // Act
      await service.createTable(mockQueryRunner, schemaName, tableName);

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain(
        'CREATE TABLE IF NOT EXISTS "workspace_test"."users"',
      );
      expect(actualCall).toContain(
        '"id" uuid PRIMARY KEY DEFAULT gen_random_uuid()',
      );
    });

    it('should create table with custom columns', async () => {
      const schemaName = 'workspace_test';
      const tableName = 'products';
      const columns = [
        { name: 'id', type: 'uuid', isPrimary: true },
        { name: 'name', type: 'varchar', isNullable: false },
        { name: 'price', type: 'decimal', default: '0.00' },
        { name: 'tags', type: 'varchar', isArray: true },
        { name: 'email', type: 'varchar', isUnique: true },
      ];

      await service.createTable(
        mockQueryRunner,
        schemaName,
        tableName,
        columns,
      );

      const expectedSql = expect.stringContaining(
        'CREATE TABLE IF NOT EXISTS "workspace_test"."products"',
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(expectedSql);

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('"id" uuid PRIMARY KEY');
      expect(actualCall).toContain('"name" varchar NOT NULL');
      expect(actualCall).toContain('"price" decimal DEFAULT 000');
      expect(actualCall).toContain('"tags" varchar[]');
      expect(actualCall).toContain('"email" varchar UNIQUE');
    });

    it('should sanitize schema and table names', async () => {
      // Prepare
      const schemaName = 'workspace_test; DROP TABLE';
      const tableName = 'users; DELETE FROM';

      // Act
      await service.createTable(mockQueryRunner, schemaName, tableName);

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('"workspace_testDROPTABLE"."usersDELETEFROM"'),
      );
    });

    it('should sanitize column names and types', async () => {
      // Prepare
      const columns = [{ name: 'user_id; DROP', type: 'varchar; EXEC' }];

      // Act
      await service.createTable(mockQueryRunner, 'schema', 'table', columns);

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('"user_idDROP" varcharEXEC');
    });
  });

  describe('dropTable', () => {
    it('should drop table with sanitized names', async () => {
      const schemaName = 'workspace_test';
      const tableName = 'old_table';

      await service.dropTable(mockQueryRunner, schemaName, tableName);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'DROP TABLE IF EXISTS "workspace_test"."old_table"',
      );
    });

    it('should sanitize dangerous input', async () => {
      const schemaName = 'schema; DROP DATABASE';
      const tableName = 'table; TRUNCATE';

      await service.dropTable(mockQueryRunner, schemaName, tableName);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'DROP TABLE IF EXISTS "schemaDROPDATABASE"."tableTRUNCATE"',
      );
    });
  });

  describe('renameTable', () => {
    it('should rename table with sanitized names', async () => {
      const schemaName = 'workspace_test';
      const oldTableName = 'old_name';
      const newTableName = 'new_name';

      await service.renameTable(
        mockQueryRunner,
        schemaName,
        oldTableName,
        newTableName,
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'ALTER TABLE "workspace_test"."old_name" RENAME TO "new_name"',
      );
    });

    it('should sanitize all table names', async () => {
      const schemaName = 'schema; DROP';
      const oldTableName = 'old; DELETE';
      const newTableName = 'new; INSERT';

      await service.renameTable(
        mockQueryRunner,
        schemaName,
        oldTableName,
        newTableName,
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'ALTER TABLE "schemaDROP"."oldDELETE" RENAME TO "newINSERT"',
      );
    });
  });

  describe('tableExists', () => {
    it('should check if table exists', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: true }]);

      const result = await service.tableExists(
        mockQueryRunner,
        'workspace_test',
        'users',
      );

      expect(result).toBe(true);
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT EXISTS'),
        ['workspace_test', 'users'],
      );
    });

    it('should return false when table does not exist', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: false }]);

      const result = await service.tableExists(
        mockQueryRunner,
        'workspace_test',
        'nonexistent',
      );

      expect(result).toBe(false);
    });

    it('should sanitize input parameters', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: false }]);

      await service.tableExists(
        mockQueryRunner,
        'schema; DROP',
        'table; DELETE',
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(expect.any(String), [
        'schemaDROP',
        'tableDELETE',
      ]);
    });

    it('should handle empty result', async () => {
      mockQueryRunner.query.mockResolvedValue([]);

      const result = await service.tableExists(
        mockQueryRunner,
        'workspace_test',
        'users',
      );

      expect(result).toBe(false);
    });
  });

  describe('SQL injection protection', () => {
    it('should prevent SQL injection in schema names', async () => {
      const maliciousSchema = "workspace'; DROP TABLE users; --";

      await service.createTable(mockQueryRunner, maliciousSchema, 'table');

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).not.toContain('DROP TABLE users');
      expect(actualCall).toContain('"workspaceDROPTABLEusers"');
    });

    it('should prevent SQL injection in table names', async () => {
      const maliciousTable = "users'; DROP DATABASE; --";

      await service.dropTable(mockQueryRunner, 'schema', maliciousTable);

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).not.toContain('DROP DATABASE');
      expect(actualCall).toContain('"usersDROPDATABASE"');
    });

    it('should prevent SQL injection in column definitions', async () => {
      const maliciousColumns = [
        {
          name: "name'; DROP TABLE",
          type: 'varchar; EXEC sp_helpdb --',
          default: "'; DELETE FROM users; --",
        },
      ];

      await service.createTable(
        mockQueryRunner,
        'schema',
        'table',
        maliciousColumns,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).not.toContain('DROP TABLE');
      expect(actualCall).not.toContain('EXEC sp_helpdb');
      expect(actualCall).not.toContain('DELETE FROM users');
      expect(actualCall).toContain('"nameDROPTABLE"');
      expect(actualCall).toContain('varcharEXECsp_helpdb');
      expect(actualCall).toContain('DEFAULT DELETEFROMusers');
    });
  });
});
