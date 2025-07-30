import { Test, TestingModule } from '@nestjs/testing';

import { QueryRunner } from 'typeorm';

import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { WorkspaceSchemaEnumManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-enum-manager.service';

describe('WorkspaceSchemaEnumManager', () => {
  let service: WorkspaceSchemaEnumManagerService;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    mockQueryRunner = {
      query: jest.fn().mockResolvedValue([]),
      isTransactionActive: false,
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceSchemaEnumManagerService],
    }).compile();

    service = module.get<WorkspaceSchemaEnumManagerService>(
      WorkspaceSchemaEnumManagerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEnum', () => {
    it('should create an enum with the given values', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const enumName = 'status_enum';
      const values = ['active', 'inactive', 'pending'];

      // Act
      await service.createEnum(mockQueryRunner, schemaName, enumName, values);

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `CREATE TYPE "workspace_test"."status_enum" AS ENUM ('active', 'inactive', 'pending')`,
      );
    });

    it('should sanitize schema name, enum name, and values', async () => {
      // Prepare
      const schemaName = 'workspace"test';
      const enumName = 'status"enum';
      const values = ['value"1', 'value"2'];

      // Act
      await service.createEnum(mockQueryRunner, schemaName, enumName, values);

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toMatch(/CREATE TYPE .+ AS ENUM/);
      expect(actualCall).toContain('"workspacetest"."statusenum"');
      expect(actualCall).toContain("'value1'");
      expect(actualCall).toContain("'value2'");
      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('status"enum');
      expect(actualCall).not.toContain('value"1');
      expect(actualCall).not.toContain('value"2');
    });

    it('should handle empty values array', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const enumName = 'empty_enum';
      const values: string[] = [];

      // Act
      await service.createEnum(mockQueryRunner, schemaName, enumName, values);

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `CREATE TYPE "workspace_test"."empty_enum" AS ENUM ()`,
      );
    });
  });

  describe('dropEnum', () => {
    it('should drop an enum', async () => {
      const schemaName = 'workspace_test';
      const enumName = 'status_enum';

      await service.dropEnum(mockQueryRunner, schemaName, enumName);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `DROP TYPE IF EXISTS "workspace_test"."status_enum"`,
      );
    });

    it('should sanitize schema name and enum name', async () => {
      const schemaName = 'workspace"test';
      const enumName = 'status"enum';

      await service.dropEnum(mockQueryRunner, schemaName, enumName);

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      // Verify the SQL is properly structured
      expect(actualCall).toMatch(/DROP TYPE IF EXISTS/);
      expect(actualCall).toContain('"workspacetest"."statusenum"');

      // Verify dangerous unescaped quotes are not present
      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('status"enum');
    });
  });

  describe('renameEnum', () => {
    it('should rename an enum', async () => {
      const schemaName = 'workspace_test';
      const oldEnumName = 'old_status_enum';
      const newEnumName = 'new_status_enum';

      await service.renameEnum(
        mockQueryRunner,
        schemaName,
        oldEnumName,
        newEnumName,
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TYPE "workspace_test"."old_status_enum" RENAME TO "new_status_enum"`,
      );
    });

    it('should sanitize all input parameters', async () => {
      const schemaName = 'workspace"test';
      const oldEnumName = 'old"enum';
      const newEnumName = 'new"enum';

      await service.renameEnum(
        mockQueryRunner,
        schemaName,
        oldEnumName,
        newEnumName,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).not.toContain('"test');
      expect(actualCall).not.toContain('old"');
      expect(actualCall).not.toContain('new"');
    });
  });

  describe('addEnumValue', () => {
    it('should add a value to an enum without position', async () => {
      const schemaName = 'workspace_test';
      const enumName = 'status_enum';
      const value = 'archived';

      await service.addEnumValue(mockQueryRunner, schemaName, enumName, value);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TYPE "workspace_test"."status_enum" ADD VALUE 'archived'`,
      );
    });

    it('should add a value before another value', async () => {
      const schemaName = 'workspace_test';
      const enumName = 'status_enum';
      const value = 'draft';
      const beforeValue = 'active';

      await service.addEnumValue(
        mockQueryRunner,
        schemaName,
        enumName,
        value,
        beforeValue,
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TYPE "workspace_test"."status_enum" ADD VALUE 'draft' BEFORE 'active'`,
      );
    });

    it('should add a value after another value', async () => {
      const schemaName = 'workspace_test';
      const enumName = 'status_enum';
      const value = 'draft';
      const afterValue = 'pending';

      await service.addEnumValue(
        mockQueryRunner,
        schemaName,
        enumName,
        value,
        undefined,
        afterValue,
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TYPE "workspace_test"."status_enum" ADD VALUE 'draft' AFTER 'pending'`,
      );
    });

    it('should prioritize before over after when both are provided', async () => {
      const schemaName = 'workspace_test';
      const enumName = 'status_enum';
      const value = 'draft';
      const beforeValue = 'active';
      const afterValue = 'pending';

      await service.addEnumValue(
        mockQueryRunner,
        schemaName,
        enumName,
        value,
        beforeValue,
        afterValue,
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TYPE "workspace_test"."status_enum" ADD VALUE 'draft' BEFORE 'active'`,
      );
    });

    it('should sanitize all input parameters', async () => {
      const schemaName = 'workspace"test';
      const enumName = 'status"enum';
      const value = 'value"test';
      const beforeValue = 'before"value';

      await service.addEnumValue(
        mockQueryRunner,
        schemaName,
        enumName,
        value,
        beforeValue,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toMatch(/ALTER TYPE .+ ADD VALUE .+ BEFORE/);
      expect(actualCall).toContain('"workspacetest"."statusenum"');
      expect(actualCall).toContain("'valuetest'");
      expect(actualCall).toContain("'beforevalue'");

      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('status"enum');
      expect(actualCall).not.toContain('value"test');
      expect(actualCall).not.toContain('before"value');
    });
  });

  describe('renameEnumValue', () => {
    it('should rename an enum value', async () => {
      const schemaName = 'workspace_test';
      const enumName = 'status_enum';
      const oldValue = 'inactive';
      const newValue = 'disabled';

      await service.renameEnumValue(
        mockQueryRunner,
        schemaName,
        enumName,
        oldValue,
        newValue,
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TYPE "workspace_test"."status_enum" RENAME VALUE 'inactive' TO 'disabled'`,
      );
    });

    it('should sanitize all input parameters', async () => {
      const schemaName = 'workspace"test';
      const enumName = 'status"enum';
      const oldValue = 'old"value';
      const newValue = 'new"value';

      await service.renameEnumValue(
        mockQueryRunner,
        schemaName,
        enumName,
        oldValue,
        newValue,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toMatch(/ALTER TYPE .+ RENAME VALUE .+ TO/);
      expect(actualCall).toContain('"workspacetest"."statusenum"');
      expect(actualCall).toContain("'oldvalue'");
      expect(actualCall).toContain("'newvalue'");

      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('status"enum');
      expect(actualCall).not.toContain('old"value');
      expect(actualCall).not.toContain('new"value');
    });
  });

  describe('enumExists', () => {
    it('should return true when enum exists', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: true }]);

      const result = await service.enumExists(
        mockQueryRunner,
        'workspace_test',
        'status_enum',
      );

      expect(result).toBe(true);
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT EXISTS (
        SELECT FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = $1 AND t.typname = $2 AND t.typtype = 'e'
      )`,
        ['workspace_test', 'status_enum'],
      );
    });

    it('should return false when enum does not exist', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: false }]);

      const result = await service.enumExists(
        mockQueryRunner,
        'workspace_test',
        'nonexistent_enum',
      );

      expect(result).toBe(false);
    });

    it('should return false when result is empty or undefined', async () => {
      mockQueryRunner.query.mockResolvedValue([]);

      const result = await service.enumExists(
        mockQueryRunner,
        'workspace_test',
        'status_enum',
      );

      expect(result).toBe(false);
    });

    it('should sanitize input parameters', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: false }]);

      await service.enumExists(
        mockQueryRunner,
        'workspace"test',
        'status"enum',
      );

      const actualCall = mockQueryRunner.query.mock.calls[0];

      expect(actualCall[1]).toEqual(['workspacetest', 'statusenum']);
    });
  });

  describe('getEnumValues', () => {
    it('should return enum values in correct order', async () => {
      const mockValues = [
        { value: 'pending' },
        { value: 'active' },
        { value: 'inactive' },
      ];

      mockQueryRunner.query.mockResolvedValue(mockValues);

      const result = await service.getEnumValues(
        mockQueryRunner,
        'workspace_test',
        'status_enum',
      );

      expect(result).toEqual(['pending', 'active', 'inactive']);
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT e.enumlabel as value
       FROM pg_type t
       JOIN pg_namespace n ON n.oid = t.typnamespace
       JOIN pg_enum e ON t.oid = e.enumtypid
       WHERE n.nspname = $1 AND t.typname = $2
       ORDER BY e.enumsortorder`,
        ['workspace_test', 'status_enum'],
      );
    });

    it('should return empty array when no values exist', async () => {
      mockQueryRunner.query.mockResolvedValue([]);

      const result = await service.getEnumValues(
        mockQueryRunner,
        'workspace_test',
        'empty_enum',
      );

      expect(result).toEqual([]);
    });

    it('should sanitize input parameters', async () => {
      mockQueryRunner.query.mockResolvedValue([]);

      await service.getEnumValues(
        mockQueryRunner,
        'workspace"test',
        'status"enum',
      );

      const actualCall = mockQueryRunner.query.mock.calls[0];

      expect(actualCall[1]).toEqual(['workspacetest', 'statusenum']);
    });
  });

  describe('getEnumNameForColumn', () => {
    it('should return enum name for regular enum column', async () => {
      mockQueryRunner.query.mockResolvedValue([
        { udt_name: 'status_enum', data_type: 'USER-DEFINED' },
      ]);

      const result = await service.getEnumNameForColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        'status',
      );

      expect(result).toBe('status_enum');
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT udt_name, data_type 
       FROM information_schema.columns 
       WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
        ['workspace_test', 'users', 'status'],
      );
    });

    it('should return enum name for array enum column', async () => {
      mockQueryRunner.query.mockResolvedValue([
        { udt_name: '_status_enum', data_type: 'ARRAY' },
      ]);

      const result = await service.getEnumNameForColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        'statuses',
      );

      expect(result).toBe('status_enum');
    });

    it('should return null when column does not exist', async () => {
      mockQueryRunner.query.mockResolvedValue([]);

      const result = await service.getEnumNameForColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        'nonexistent',
      );

      expect(result).toBeNull();
    });

    it('should sanitize input parameters', async () => {
      mockQueryRunner.query.mockResolvedValue([]);

      await service.getEnumNameForColumn(
        mockQueryRunner,
        'workspace"test',
        'users"table',
        'status"column',
      );

      const actualCall = mockQueryRunner.query.mock.calls[0];

      expect(actualCall[1]).toEqual([
        'workspacetest',
        'userstable',
        'statuscolumn',
      ]);
    });
  });

  describe('alterEnumValues', () => {
    beforeEach(() => {
      jest
        .spyOn(service, 'getEnumNameForColumn')
        .mockResolvedValue('old_status_enum');
    });

    it('should alter enum values with proper sequence of operations', async () => {
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const columnName = 'status';
      const newValues = ['draft', 'published', 'archived'];
      const valueMapping = { active: 'published', inactive: 'archived' };

      mockQueryRunner.query.mockImplementation((sql: string) => {
        if (sql.includes('SELECT id')) {
          const columnMatch = sql.match(/SELECT id, "([^"]+)"/);
          const columnName = columnMatch ? columnMatch[1] : 'old_status';

          return Promise.resolve([
            { id: '1', [columnName]: 'active' },
            { id: '2', [columnName]: 'inactive' },
          ]);
        }

        return Promise.resolve([]);
      });

      await service.alterEnumValues(
        mockQueryRunner,
        schemaName,
        tableName,
        columnName,
        newValues,
        valueMapping,
      );

      const calls = mockQueryRunner.query.mock.calls.map((call) => call[0]);

      expect(
        calls.some((call) => call.includes('RENAME COLUMN "status" TO')),
      ).toBe(true);

      expect(
        calls.some((call) => call.includes('RENAME TO "old_status_enum_temp"')),
      ).toBe(true);

      expect(
        calls.some(
          (call) =>
            call.includes('CREATE TYPE') && call.includes('users_status_enum'),
        ),
      ).toBe(true);

      expect(calls.some((call) => call.includes('ADD COLUMN "status"'))).toBe(
        true,
      );

      expect(
        calls.some(
          (call) => call.includes('UPDATE') && call.includes('CASE "old_'),
        ),
      ).toBe(true);

      expect(calls.some((call) => call.includes('DROP COLUMN'))).toBe(true);

      expect(
        calls.some(
          (call) => call.includes('DROP TYPE') && call.includes('temp'),
        ),
      ).toBe(true);
    });

    it('should throw exception when enum type is not found', async () => {
      jest.spyOn(service, 'getEnumNameForColumn').mockResolvedValue(null);

      await expect(
        service.alterEnumValues(
          mockQueryRunner,
          'workspace_test',
          'users',
          'nonexistent_column',
          ['value1'],
        ),
      ).rejects.toThrow(
        new TwentyORMException(
          'Enum type not found for column nonexistent_column',
          TwentyORMExceptionCode.ENUM_TYPE_NAME_NOT_FOUND,
        ),
      );
    });

    it('should handle empty value mapping', async () => {
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const columnName = 'status';
      const newValues = ['new_value'];

      mockQueryRunner.query.mockImplementation((sql: string) => {
        if (sql.includes('SELECT id')) {
          return Promise.resolve([{ id: '1', old_status: 'old_value' }]);
        }

        return Promise.resolve([]);
      });

      await service.alterEnumValues(
        mockQueryRunner,
        schemaName,
        tableName,
        columnName,
        newValues,
      );

      expect(mockQueryRunner.query).toHaveBeenCalled();
    });
  });
});
