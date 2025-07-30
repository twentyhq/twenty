import { Test, TestingModule } from '@nestjs/testing';

import { QueryRunner } from 'typeorm';

import { WorkspaceSchemaColumnManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-column-manager.service';

describe('WorkspaceSchemaColumnManager', () => {
  let service: WorkspaceSchemaColumnManagerService;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    mockQueryRunner = {
      query: jest.fn().mockResolvedValue([]),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceSchemaColumnManagerService],
    }).compile();

    service = module.get<WorkspaceSchemaColumnManagerService>(
      WorkspaceSchemaColumnManagerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addColumn', () => {
    it('should add column with sanitized names', async () => {
      // Prepare
      const column = {
        name: 'user_name',
        type: 'varchar',
        isNullable: false,
      };

      // Act
      await service.addColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        column,
      );

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining(
          'ALTER TABLE "workspace_test"."users" ADD COLUMN',
        ),
      );
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('"user_name" varchar NOT NULL'),
      );
    });

    it('should sanitize schema, table, and column names', async () => {
      // Prepare
      const column = {
        name: 'col; DROP',
        type: 'varchar; EXEC',
      };

      // Act
      await service.addColumn(
        mockQueryRunner,
        'schema; DELETE',
        'table; UPDATE',
        column,
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('"schemaDELETE"."tableUPDATE"');
      expect(actualCall).toContain('"colDROP" varcharEXEC');
    });

    it('should handle array columns', async () => {
      // Prepare
      const column = {
        name: 'tags',
        type: 'varchar',
        isArray: true,
      };

      // Act
      await service.addColumn(
        mockQueryRunner,
        'workspace_test',
        'posts',
        column,
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('"tags" varchar[]');
    });

    it('should handle columns with defaults', async () => {
      // Prepare
      const column = {
        name: 'status',
        type: 'varchar',
        default: 'active',
      };

      // Act
      await service.addColumn(
        mockQueryRunner,
        'workspace_test',
        'posts',
        column,
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('DEFAULT active');
    });

    it('should handle primary key columns', async () => {
      // Prepare
      const column = {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
      };

      // Act
      await service.addColumn(
        mockQueryRunner,
        'workspace_test',
        'posts',
        column,
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('"id" uuid PRIMARY KEY');
    });

    it('should handle unique columns', async () => {
      // Prepare
      const column = {
        name: 'email',
        type: 'varchar',
        isUnique: true,
      };

      // Act
      await service.addColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        column,
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('"email" varchar UNIQUE');
    });
  });

  describe('dropColumn', () => {
    it('should drop column with sanitized names', async () => {
      await service.dropColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        'old_column',
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'ALTER TABLE "workspace_test"."users" DROP COLUMN IF EXISTS "old_column"',
      );
    });

    it('should sanitize all input parameters', async () => {
      await service.dropColumn(
        mockQueryRunner,
        'schema; DROP',
        'table; DELETE',
        'col; TRUNCATE',
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'ALTER TABLE "schemaDROP"."tableDELETE" DROP COLUMN IF EXISTS "colTRUNCATE"',
      );
    });
  });

  describe('dropColumns', () => {
    it('should drop multiple columns', async () => {
      const columnNames = ['col1', 'col2', 'col3'];

      await service.dropColumns(
        mockQueryRunner,
        'workspace_test',
        'users',
        columnNames,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('ALTER TABLE "workspace_test"."users"');
      expect(actualCall).toContain('DROP COLUMN IF EXISTS "col1"');
      expect(actualCall).toContain('DROP COLUMN IF EXISTS "col2"');
      expect(actualCall).toContain('DROP COLUMN IF EXISTS "col3"');
    });

    it('should handle empty column list', async () => {
      await service.dropColumns(mockQueryRunner, 'schema', 'table', []);

      expect(mockQueryRunner.query).not.toHaveBeenCalled();
    });

    it('should sanitize column names', async () => {
      const columnNames = ['col1; DROP', 'col2; DELETE'];

      await service.dropColumns(
        mockQueryRunner,
        'schema',
        'table',
        columnNames,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('DROP COLUMN IF EXISTS "col1DROP"');
      expect(actualCall).toContain('DROP COLUMN IF EXISTS "col2DELETE"');
    });
  });

  describe('renameColumn', () => {
    it('should rename column with sanitized names', async () => {
      await service.renameColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        'old_name',
        'new_name',
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'ALTER TABLE "workspace_test"."users" RENAME COLUMN "old_name" TO "new_name"',
      );
    });

    it('should sanitize all parameters', async () => {
      await service.renameColumn(
        mockQueryRunner,
        'schema; DROP',
        'table; DELETE',
        'old; TRUNCATE',
        'new; UPDATE',
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'ALTER TABLE "schemaDROP"."tableDELETE" RENAME COLUMN "oldTRUNCATE" TO "newUPDATE"',
      );
    });
  });

  describe('alterColumnType', () => {
    it('should alter column type', async () => {
      await service.alterColumnType(
        mockQueryRunner,
        'workspace_test',
        'users',
        'age',
        'bigint',
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining(
          'ALTER TABLE "workspace_test"."users" ALTER COLUMN "age" TYPE bigint',
        ),
      );
    });

    it('should handle USING clause', async () => {
      await service.alterColumnType(
        mockQueryRunner,
        'workspace_test',
        'users',
        'data',
        'jsonb',
        'data::jsonb',
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('USING data::jsonb');
    });
  });

  describe('columnExists', () => {
    it('should check if column exists', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: true }]);

      const result = await service.columnExists(
        mockQueryRunner,
        'workspace_test',
        'users',
        'email',
      );

      expect(result).toBe(true);
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT EXISTS'),
        ['workspace_test', 'users', 'email'],
      );
    });

    it('should return false when column does not exist', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: false }]);

      const result = await service.columnExists(
        mockQueryRunner,
        'workspace_test',
        'users',
        'nonexistent',
      );

      expect(result).toBe(false);
    });

    it('should sanitize input parameters', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: false }]);

      await service.columnExists(
        mockQueryRunner,
        'schema; DROP',
        'table; DELETE',
        'col; TRUNCATE',
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(expect.any(String), [
        'schemaDROP',
        'tableDELETE',
        'colTRUNCATE',
      ]);
    });
  });

  describe('buildColumnDefinition', () => {
    it('should build basic column definition', () => {
      const column = {
        name: 'username',
        type: 'varchar',
      };

      const result = (service as any).buildColumnDefinition(column);

      expect(result).toBe('"username" varchar');
    });

    it('should build column with constraints', () => {
      const column = {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
        isNullable: false,
        isUnique: true,
        default: 'gen_random_uuid()',
      };

      const result = (service as any).buildColumnDefinition(column);

      expect(result).toContain('"id" uuid');
      expect(result).toContain('PRIMARY KEY');
      expect(result).toContain('NOT NULL');
      expect(result).toContain('UNIQUE');
      expect(result).toContain('DEFAULT gen_random_uuid()');
    });

    it('should build array column', () => {
      const column = {
        name: 'tags',
        type: 'varchar',
        isArray: true,
      };

      const result = (service as any).buildColumnDefinition(column);

      expect(result).toBe('"tags" varchar[]');
    });

    it('should build generated column', () => {
      const column = {
        name: 'full_name',
        type: 'varchar',
        asExpression: "first_name || ' ' || last_name",
        generatedType: 'STORED' as const,
      };

      const result = (service as any).buildColumnDefinition(column);

      expect(result).toContain("AS (first_name || ' ' || last_name)");
      expect(result).toContain('STORED');
    });

    it('should sanitize column name and type', () => {
      const column = {
        name: 'col; DROP',
        type: 'varchar; EXEC',
      };

      const result = (service as any).buildColumnDefinition(column);

      expect(result).toBe('"colDROP" varcharEXEC');
    });
  });

  describe('SQL injection protection', () => {
    it('should prevent SQL injection in column operations', async () => {
      const maliciousColumn = {
        name: "name'; DROP TABLE users; --",
        type: "varchar'; EXEC xp_cmdshell; --",
        default: "'; DELETE FROM admin; --",
      };

      await service.addColumn(
        mockQueryRunner,
        'schema',
        'table',
        maliciousColumn,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).not.toContain('DROP TABLE users');
      expect(actualCall).not.toContain('EXEC xp_cmdshell');
      expect(actualCall).not.toContain('DELETE FROM admin');
      expect(actualCall).toContain('"nameDROPTABLEusers"');
      expect(actualCall).toContain('varcharEXECxp_cmdshell');
    });

    it('should prevent SQL injection in rename operations', async () => {
      const maliciousOldName = "old'; DROP TABLE users; --";
      const maliciousNewName = "new'; DELETE FROM admin; --";

      await service.renameColumn(
        mockQueryRunner,
        'schema',
        'table',
        maliciousOldName,
        maliciousNewName,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).not.toContain('DROP TABLE users');
      expect(actualCall).not.toContain('DELETE FROM admin');
      expect(actualCall).toContain('"oldDROPTABLEusers"');
      expect(actualCall).toContain('"newDELETEFROMadmin"');
    });
  });
});
