import { Test, TestingModule } from '@nestjs/testing';

import { QueryRunner } from 'typeorm';

import { WorkspaceSchemaForeignKeyManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-foreign-key-manager.service';
import { WorkspaceSchemaForeignKeyDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-foreign-key-definition.type';

describe('WorkspaceSchemaForeignKeyManager', () => {
  let service: WorkspaceSchemaForeignKeyManagerService;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    mockQueryRunner = {
      query: jest.fn().mockResolvedValue([]),
      connection: {
        namingStrategy: {
          foreignKeyName: jest.fn().mockReturnValue('FK_user_company'),
        },
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceSchemaForeignKeyManagerService],
    }).compile();

    service = module.get<WorkspaceSchemaForeignKeyManagerService>(
      WorkspaceSchemaForeignKeyManagerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createForeignKey', () => {
    it('should create a foreign key constraint', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const foreignKey: WorkspaceSchemaForeignKeyDefinition = {
        name: 'FK_user_company',
        columnNames: ['companyId'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
      };

      // Act
      await service.createForeignKey(
        mockQueryRunner,
        schemaName,
        tableName,
        foreignKey,
      );

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TABLE "workspace_test"."users" ADD CONSTRAINT "FK_user_company" FOREIGN KEY ("companyId") REFERENCES "workspace_test"."companies" ("id")`,
      );
    });

    it('should create a foreign key with ON DELETE CASCADE', async () => {
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const foreignKey: WorkspaceSchemaForeignKeyDefinition = {
        name: 'FK_user_company',
        columnNames: ['companyId'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      };

      await service.createForeignKey(
        mockQueryRunner,
        schemaName,
        tableName,
        foreignKey,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('ON DELETE CASCADE');
    });

    it('should create a foreign key with ON UPDATE SET NULL', async () => {
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const foreignKey: WorkspaceSchemaForeignKeyDefinition = {
        name: 'FK_user_company',
        columnNames: ['companyId'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onUpdate: 'SET NULL',
      };

      await service.createForeignKey(
        mockQueryRunner,
        schemaName,
        tableName,
        foreignKey,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('ON UPDATE SET NULL');
    });

    it('should create a foreign key with both ON DELETE and ON UPDATE', async () => {
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const foreignKey: WorkspaceSchemaForeignKeyDefinition = {
        name: 'FK_user_company',
        columnNames: ['companyId'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT',
      };

      await service.createForeignKey(
        mockQueryRunner,
        schemaName,
        tableName,
        foreignKey,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('ON DELETE CASCADE');
      expect(actualCall).toContain('ON UPDATE RESTRICT');
    });

    it('should handle multiple columns in foreign key', async () => {
      const schemaName = 'workspace_test';
      const tableName = 'orders';
      const foreignKey: WorkspaceSchemaForeignKeyDefinition = {
        name: 'FK_order_composite',
        columnNames: ['userId', 'companyId'],
        referencedTableName: 'user_companies',
        referencedColumnNames: ['userId', 'companyId'],
      };

      await service.createForeignKey(
        mockQueryRunner,
        schemaName,
        tableName,
        foreignKey,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('("userId", "companyId")');
      expect(actualCall).toContain(
        'REFERENCES "workspace_test"."user_companies" ("userId", "companyId")',
      );
    });

    it('should sanitize all input parameters', async () => {
      // Prepare
      const schemaName = 'workspace"test';
      const tableName = 'users"table';
      const foreignKey: WorkspaceSchemaForeignKeyDefinition = {
        name: 'FK"constraint',
        columnNames: ['column"id'],
        referencedTableName: 'ref"table',
        referencedColumnNames: ['ref"id'],
      };

      // Act
      await service.createForeignKey(
        mockQueryRunner,
        schemaName,
        tableName,
        foreignKey,
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toMatch(
        /ALTER TABLE .+ ADD CONSTRAINT .+ FOREIGN KEY/,
      );
      expect(actualCall).toContain('"workspacetest"."userstable"');
      expect(actualCall).toContain('"FKconstraint"');
      expect(actualCall).toContain('"columnid"');
      expect(actualCall).toContain('"reftable"');
      expect(actualCall).toContain('"refid"');
      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('users"table');
      expect(actualCall).not.toContain('FK"constraint');
      expect(actualCall).not.toContain('column"id');
      expect(actualCall).not.toContain('ref"table');
      expect(actualCall).not.toContain('ref"id');
    });
  });

  describe('dropForeignKey', () => {
    it('should drop a foreign key constraint', async () => {
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const foreignKeyName = 'FK_user_company';

      await service.dropForeignKey(
        mockQueryRunner,
        schemaName,
        tableName,
        foreignKeyName,
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TABLE "workspace_test"."users" DROP CONSTRAINT IF EXISTS "FK_user_company"`,
      );
    });

    it('should sanitize input parameters', async () => {
      const schemaName = 'workspace"test';
      const tableName = 'users"table';
      const foreignKeyName = 'FK"constraint';

      await service.dropForeignKey(
        mockQueryRunner,
        schemaName,
        tableName,
        foreignKeyName,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      // Verify the SQL is properly structured
      expect(actualCall).toMatch(/ALTER TABLE .+ DROP CONSTRAINT IF EXISTS/);
      expect(actualCall).toContain('"workspacetest"."userstable"');
      expect(actualCall).toContain('"FKconstraint"');

      // Verify dangerous unescaped quotes are not present
      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('users"table');
      expect(actualCall).not.toContain('FK"constraint');
    });
  });

  describe('dropForeignKeyByColumn', () => {
    it('should drop foreign key by column when constraint exists', async () => {
      jest
        .spyOn(service, 'getForeignKeyNameByColumn')
        .mockResolvedValue('FK_user_company');
      const dropForeignKeySpy = jest
        .spyOn(service, 'dropForeignKey')
        .mockResolvedValue();

      await service.dropForeignKeyByColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        'companyId',
      );

      expect(service.getForeignKeyNameByColumn).toHaveBeenCalledWith(
        mockQueryRunner,
        'workspace_test',
        'users',
        'companyId',
      );
      expect(dropForeignKeySpy).toHaveBeenCalledWith(
        mockQueryRunner,
        'workspace_test',
        'users',
        'FK_user_company',
      );
    });

    it('should do nothing when no foreign key exists for column', async () => {
      jest.spyOn(service, 'getForeignKeyNameByColumn').mockResolvedValue(null);
      const dropForeignKeySpy = jest
        .spyOn(service, 'dropForeignKey')
        .mockResolvedValue();

      await service.dropForeignKeyByColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        'nonConstrainedColumn',
      );

      expect(service.getForeignKeyNameByColumn).toHaveBeenCalledWith(
        mockQueryRunner,
        'workspace_test',
        'users',
        'nonConstrainedColumn',
      );
      expect(dropForeignKeySpy).not.toHaveBeenCalled();
    });
  });

  describe('foreignKeyExists', () => {
    it('should return true when foreign key exists', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: true }]);

      const result = await service.foreignKeyExists(
        mockQueryRunner,
        'workspace_test',
        'users',
        'FK_user_company',
      );

      expect(result).toBe(true);
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_schema = $1 
          AND table_name = $2 
          AND constraint_name = $3 
          AND constraint_type = 'FOREIGN KEY'
      )`,
        ['workspace_test', 'users', 'FK_user_company'],
      );
    });

    it('should return false when foreign key does not exist', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: false }]);

      const result = await service.foreignKeyExists(
        mockQueryRunner,
        'workspace_test',
        'users',
        'FK_nonexistent',
      );

      expect(result).toBe(false);
    });

    it('should return false when result is empty', async () => {
      mockQueryRunner.query.mockResolvedValue([]);

      const result = await service.foreignKeyExists(
        mockQueryRunner,
        'workspace_test',
        'users',
        'FK_user_company',
      );

      expect(result).toBe(false);
    });

    it('should sanitize input parameters', async () => {
      mockQueryRunner.query.mockResolvedValue([{ exists: false }]);

      await service.foreignKeyExists(
        mockQueryRunner,
        'workspace"test',
        'users"table',
        'FK"constraint',
      );

      const actualCall = mockQueryRunner.query.mock.calls[0];

      expect(actualCall[1]).toEqual([
        'workspacetest',
        'userstable',
        'FKconstraint',
      ]);
    });
  });

  describe('getForeignKeyNameByColumn', () => {
    it('should return foreign key name for column', async () => {
      mockQueryRunner.query.mockResolvedValue([
        { constraint_name: 'FK_user_company' },
      ]);

      const result = await service.getForeignKeyNameByColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        'companyId',
      );

      expect(result).toBe('FK_user_company');
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT tc.constraint_name
       FROM information_schema.table_constraints AS tc
       JOIN information_schema.key_column_usage AS kcu
         ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
       WHERE tc.constraint_type = 'FOREIGN KEY'
         AND tc.table_schema = $1
         AND tc.table_name = $2
         AND kcu.column_name = $3`,
        ['workspace_test', 'users', 'companyId'],
      );
    });

    it('should return null when no foreign key exists for column', async () => {
      mockQueryRunner.query.mockResolvedValue([]);

      const result = await service.getForeignKeyNameByColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        'nonConstrainedColumn',
      );

      expect(result).toBeNull();
    });

    it('should sanitize input parameters', async () => {
      mockQueryRunner.query.mockResolvedValue([]);

      await service.getForeignKeyNameByColumn(
        mockQueryRunner,
        'workspace"test',
        'users"table',
        'column"id',
      );

      const actualCall = mockQueryRunner.query.mock.calls[0];

      expect(actualCall[1]).toEqual([
        'workspacetest',
        'userstable',
        'columnid',
      ]);
    });
  });

  describe('getForeignKeysForTable', () => {
    it('should return all foreign keys for a table', async () => {
      const mockForeignKeys = [
        {
          constraint_name: 'FK_user_company',
          column_name: 'companyId',
          foreign_table_name: 'companies',
          foreign_column_name: 'id',
          delete_rule: 'CASCADE',
          update_rule: 'RESTRICT',
        },
        {
          constraint_name: 'FK_user_department',
          column_name: 'departmentId',
          foreign_table_name: 'departments',
          foreign_column_name: 'id',
          delete_rule: 'SET NULL',
          update_rule: 'NO ACTION',
        },
      ];

      mockQueryRunner.query.mockResolvedValue(mockForeignKeys);

      const result = await service.getForeignKeysForTable(
        mockQueryRunner,
        'workspace_test',
        'users',
      );

      expect(result).toEqual(mockForeignKeys);
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['workspace_test', 'users'],
      );
    });

    it('should return empty array when no foreign keys exist', async () => {
      mockQueryRunner.query.mockResolvedValue([]);

      const result = await service.getForeignKeysForTable(
        mockQueryRunner,
        'workspace_test',
        'standalone_table',
      );

      expect(result).toEqual([]);
    });

    it('should sanitize input parameters', async () => {
      mockQueryRunner.query.mockResolvedValue([]);

      await service.getForeignKeysForTable(
        mockQueryRunner,
        'workspace"test',
        'users"table',
      );

      const actualCall = mockQueryRunner.query.mock.calls[0];

      expect(actualCall[1]).toEqual(['workspacetest', 'userstable']);
    });
  });

  describe('createForeignKeyFromColumn', () => {
    it('should create foreign key from column with default referenced column', async () => {
      const createForeignKeySpy = jest
        .spyOn(service, 'createForeignKey')
        .mockResolvedValue();

      await service.createForeignKeyFromColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        'companyId',
        'companies',
      );

      expect(
        mockQueryRunner.connection.namingStrategy.foreignKeyName,
      ).toHaveBeenCalledWith(
        'users',
        ['companyId'],
        'workspace_test.companies',
        ['id'],
      );
      expect(createForeignKeySpy).toHaveBeenCalledWith(
        mockQueryRunner,
        'workspace_test',
        'users',
        {
          name: 'FK_user_company',
          columnNames: ['companyId'],
          referencedTableName: 'companies',
          referencedColumnNames: ['id'],
          onDelete: undefined,
        },
      );
    });

    it('should create foreign key with custom referenced column and onDelete', async () => {
      const createForeignKeySpy = jest
        .spyOn(service, 'createForeignKey')
        .mockResolvedValue();

      await service.createForeignKeyFromColumn(
        mockQueryRunner,
        'workspace_test',
        'users',
        'companyCode',
        'companies',
        'code',
        'SET NULL',
      );

      expect(createForeignKeySpy).toHaveBeenCalledWith(
        mockQueryRunner,
        'workspace_test',
        'users',
        {
          name: 'FK_user_company',
          columnNames: ['companyCode'],
          referencedTableName: 'companies',
          referencedColumnNames: ['code'],
          onDelete: 'SET NULL',
        },
      );
    });
  });

  describe('renameForeignKey', () => {
    it('should rename a foreign key constraint', async () => {
      await service.renameForeignKey(
        mockQueryRunner,
        'workspace_test',
        'users',
        'FK_old_name',
        'FK_new_name',
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TABLE "workspace_test"."users" RENAME CONSTRAINT "FK_old_name" TO "FK_new_name"`,
      );
    });

    it('should sanitize input parameters', async () => {
      await service.renameForeignKey(
        mockQueryRunner,
        'workspace"test',
        'users"table',
        'FK"old',
        'FK"new',
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toMatch(/ALTER TABLE .+ RENAME CONSTRAINT .+ TO/);
      expect(actualCall).toContain('"workspacetest"."userstable"');
      expect(actualCall).toContain('"FKold"');
      expect(actualCall).toContain('"FKnew"');

      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('users"table');
      expect(actualCall).not.toContain('FK"old');
      expect(actualCall).not.toContain('FK"new');
    });
  });

  describe('validateForeignKey', () => {
    it('should validate a foreign key constraint', async () => {
      await service.validateForeignKey(
        mockQueryRunner,
        'workspace_test',
        'users',
        'FK_user_company',
      );

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TABLE "workspace_test"."users" VALIDATE CONSTRAINT "FK_user_company"`,
      );
    });

    it('should sanitize input parameters', async () => {
      await service.validateForeignKey(
        mockQueryRunner,
        'workspace"test',
        'users"table',
        'FK"constraint',
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toMatch(/ALTER TABLE .+ VALIDATE CONSTRAINT/);
      expect(actualCall).toContain('"workspacetest"."userstable"');
      expect(actualCall).toContain('"FKconstraint"');

      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('users"table');
      expect(actualCall).not.toContain('FK"constraint');
    });
  });
});
