import { Test, TestingModule } from '@nestjs/testing';

import { QueryRunner } from 'typeorm';

import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';
import { WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';

describe('WorkspaceSchemaIndexManager', () => {
  let service: WorkspaceSchemaIndexManagerService;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    mockQueryRunner = {
      query: jest.fn().mockResolvedValue([]),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceSchemaIndexManagerService],
    }).compile();

    service = module.get<WorkspaceSchemaIndexManagerService>(
      WorkspaceSchemaIndexManagerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createIndex', () => {
    it('should create a basic index', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const index: WorkspaceSchemaIndexDefinition = {
        name: 'idx_users_email',
        columns: ['email'],
      };

      // Act
      await service.createIndex(mockQueryRunner, schemaName, tableName, index);

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `CREATE INDEX IF NOT EXISTS "idx_users_email" ON "workspace_test"."users" ("email")`,
      );
    });

    it('should create a unique index', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const index: WorkspaceSchemaIndexDefinition = {
        name: 'idx_users_email_unique',
        columns: ['email'],
        isUnique: true,
      };

      // Act
      await service.createIndex(mockQueryRunner, schemaName, tableName, index);

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('CREATE UNIQUE INDEX');
    });

    it('should create index with specific type', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const index: WorkspaceSchemaIndexDefinition = {
        name: 'idx_users_data_gin',
        columns: ['data'],
        type: 'GIN',
      };

      // Act
      await service.createIndex(mockQueryRunner, schemaName, tableName, index);

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('USING GIN');
    });

    it('should create index with BTREE type (default)', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const index: WorkspaceSchemaIndexDefinition = {
        name: 'idx_users_name',
        columns: ['name'],
        type: 'BTREE',
      };

      // Act
      await service.createIndex(mockQueryRunner, schemaName, tableName, index);

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).not.toContain('USING BTREE');
    });

    it('should create index with WHERE clause', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const index: WorkspaceSchemaIndexDefinition = {
        name: 'idx_users_active_email',
        columns: ['email'],
        where: 'active = true',
      };

      // Act
      await service.createIndex(mockQueryRunner, schemaName, tableName, index);

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('WHERE active = true');
    });

    it('should create index with INCLUDE clause', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const index: WorkspaceSchemaIndexDefinition = {
        name: 'idx_users_email_include',
        columns: ['email'],
        include: ['name', 'created_at'],
      };

      // Act
      await service.createIndex(mockQueryRunner, schemaName, tableName, index);

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('INCLUDE ("name", "created_at")');
    });

    it('should create composite index with multiple columns', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const index: WorkspaceSchemaIndexDefinition = {
        name: 'idx_users_company_department',
        columns: ['companyId', 'departmentId'],
      };

      // Act
      await service.createIndex(mockQueryRunner, schemaName, tableName, index);

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('("companyId", "departmentId")');
    });

    it('should create index with all options combined', async () => {
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const index: WorkspaceSchemaIndexDefinition = {
        name: 'idx_users_complex',
        columns: ['email', 'status'],
        type: 'BTREE',
        isUnique: true,
        where: 'deleted_at IS NULL',
        include: ['name'],
      };

      await service.createIndex(mockQueryRunner, schemaName, tableName, index);

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('CREATE UNIQUE INDEX');
      expect(actualCall).toContain('("email", "status")');
      expect(actualCall).toContain('INCLUDE ("name")');
      expect(actualCall).toContain('WHERE deleted_at IS NULL');
    });

    it('should handle index creation errors gracefully for existing index', async () => {
      const error = new Error('Index already exists') as any;

      error.code = '42P07';
      mockQueryRunner.query.mockRejectedValue(error);

      const schemaName = 'workspace_test';
      const tableName = 'users';
      const index: WorkspaceSchemaIndexDefinition = {
        name: 'idx_existing',
        columns: ['email'],
      };

      await expect(
        service.createIndex(mockQueryRunner, schemaName, tableName, index),
      ).resolves.not.toThrow();
    });

    it('should rethrow non-existing index errors', async () => {
      const error = new Error('Other database error') as any;

      error.code = '42000';
      mockQueryRunner.query.mockRejectedValue(error);

      const schemaName = 'workspace_test';
      const tableName = 'users';
      const index: WorkspaceSchemaIndexDefinition = {
        name: 'idx_failing',
        columns: ['email'],
      };

      await expect(
        service.createIndex(mockQueryRunner, schemaName, tableName, index),
      ).rejects.toThrow('Other database error');
    });

    it('should sanitize all input parameters', async () => {
      // Prepare
      const schemaName = 'workspace"test';
      const tableName = 'users"table';
      const index: WorkspaceSchemaIndexDefinition = {
        name: 'idx"test',
        columns: ['email"col', 'name"col'],
        include: ['include"col'],
      };

      // Act
      await service.createIndex(mockQueryRunner, schemaName, tableName, index);

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toMatch(/CREATE\s+INDEX IF NOT EXISTS/);
      expect(actualCall).toContain('"workspacetest"."userstable"');
      expect(actualCall).toContain('"idxtest"');
      expect(actualCall).toContain('"emailcol"');
      expect(actualCall).toContain('"namecol"');
      expect(actualCall).toContain('"includecol"');
      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('users"table');
      expect(actualCall).not.toContain('idx"test');
      expect(actualCall).not.toContain('email"col');
      expect(actualCall).not.toContain('name"col');
      expect(actualCall).not.toContain('include"col');
    });
  });

  describe('dropIndex', () => {
    it('should drop an index', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const indexName = 'idx_users_email';

      // Act
      await service.dropIndex(mockQueryRunner, schemaName, indexName);

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `DROP INDEX IF EXISTS "workspace_test"."idx_users_email"`,
      );
    });

    it('should handle index drop errors gracefully for non-existing index', async () => {
      const error = new Error('Index does not exist') as any;

      error.code = '42704';
      mockQueryRunner.query.mockRejectedValue(error);

      await expect(
        service.dropIndex(mockQueryRunner, 'workspace_test', 'idx_nonexistent'),
      ).resolves.not.toThrow();
    });

    it('should rethrow non-missing index errors', async () => {
      const error = new Error('Other database error') as any;

      error.code = '42000';
      mockQueryRunner.query.mockRejectedValue(error);

      await expect(
        service.dropIndex(mockQueryRunner, 'workspace_test', 'idx_failing'),
      ).rejects.toThrow('Other database error');
    });

    it('should sanitize input parameters', async () => {
      // Prepare
      const schemaName = 'workspace"test';
      const indexName = 'idx"test';

      // Act
      await service.dropIndex(mockQueryRunner, schemaName, indexName);

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).not.toContain('"test');
      expect(actualCall).not.toContain('idx"');
    });
  });

  describe('renameIndex', () => {
    it('should rename an index', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const oldIndexName = 'idx_old_name';
      const newIndexName = 'idx_new_name';

      // Act
      await service.renameIndex(
        mockQueryRunner,
        schemaName,
        oldIndexName,
        newIndexName,
      );

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER INDEX "workspace_test"."idx_old_name" RENAME TO "idx_new_name"`,
      );
    });

    it('should sanitize input parameters', async () => {
      // Prepare
      const schemaName = 'workspace"test';
      const oldIndexName = 'idx"old';
      const newIndexName = 'idx"new';

      // Act
      await service.renameIndex(
        mockQueryRunner,
        schemaName,
        oldIndexName,
        newIndexName,
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).not.toContain('"test');
      expect(actualCall).not.toContain('idx"');
    });
  });

  describe('indexExists', () => {
    it('should return true when index exists', async () => {
      // Prepare
      mockQueryRunner.query.mockResolvedValue([{ exists: true }]);

      // Act
      const result = await service.indexExists(
        mockQueryRunner,
        'workspace_test',
        'idx_users_email',
      );

      // Assert
      expect(result).toBe(true);
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = $1 AND indexname = $2
      )`,
        ['workspace_test', 'idx_users_email'],
      );
    });

    it('should return false when index does not exist', async () => {
      // Prepare
      mockQueryRunner.query.mockResolvedValue([{ exists: false }]);

      // Act
      const result = await service.indexExists(
        mockQueryRunner,
        'workspace_test',
        'idx_nonexistent',
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when result is empty', async () => {
      // Prepare
      mockQueryRunner.query.mockResolvedValue([]);

      // Act
      const result = await service.indexExists(
        mockQueryRunner,
        'workspace_test',
        'idx_users_email',
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should sanitize input parameters', async () => {
      // Prepare
      mockQueryRunner.query.mockResolvedValue([{ exists: false }]);

      // Act
      await service.indexExists(mockQueryRunner, 'workspace"test', 'idx"test');

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0];

      expect(actualCall[1]).toEqual(['workspacetest', 'idxtest']);
    });
  });

  describe('getIndexesForTable', () => {
    it('should return all indexes for a table', async () => {
      // Prepare
      const mockIndexes = [
        {
          indexname: 'idx_users_email',
          indexdef: 'CREATE INDEX idx_users_email ON users (email)',
        },
        {
          indexname: 'idx_users_name',
          indexdef: 'CREATE INDEX idx_users_name ON users (name)',
        },
      ];

      mockQueryRunner.query.mockResolvedValue(mockIndexes);

      // Act
      const result = await service.getIndexesForTable(
        mockQueryRunner,
        'workspace_test',
        'users',
      );

      // Assert
      expect(result).toEqual(mockIndexes);
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT indexname, indexdef 
       FROM pg_indexes 
       WHERE schemaname = $1 AND tablename = $2`,
        ['workspace_test', 'users'],
      );
    });

    it('should return empty array when no indexes exist', async () => {
      // Prepare
      mockQueryRunner.query.mockResolvedValue([]);

      // Act
      const result = await service.getIndexesForTable(
        mockQueryRunner,
        'workspace_test',
        'empty_table',
      );

      // Assert
      expect(result).toEqual([]);
    });

    it('should sanitize input parameters', async () => {
      // Prepare
      mockQueryRunner.query.mockResolvedValue([]);

      // Act
      await service.getIndexesForTable(
        mockQueryRunner,
        'workspace"test',
        'users"table',
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0];

      expect(actualCall[1]).toEqual(['workspacetest', 'userstable']);
    });
  });

  describe('createPrimaryKey', () => {
    it('should create a primary key constraint', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const constraintName = 'PK_users';
      const columnNames = ['id'];

      // Act
      await service.createPrimaryKey(
        mockQueryRunner,
        schemaName,
        tableName,
        constraintName,
        columnNames,
      );

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TABLE "workspace_test"."users" ADD CONSTRAINT "PK_users" PRIMARY KEY ("id")`,
      );
    });

    it('should create composite primary key', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'user_roles';
      const constraintName = 'PK_user_roles';
      const columnNames = ['userId', 'roleId'];

      // Act
      await service.createPrimaryKey(
        mockQueryRunner,
        schemaName,
        tableName,
        constraintName,
        columnNames,
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('PRIMARY KEY ("userId", "roleId")');
    });

    it('should sanitize input parameters', async () => {
      // Prepare
      const schemaName = 'workspace"test';
      const tableName = 'users"table';
      const constraintName = 'PK"test';
      const columnNames = ['id"col'];

      // Act
      await service.createPrimaryKey(
        mockQueryRunner,
        schemaName,
        tableName,
        constraintName,
        columnNames,
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toMatch(
        /ALTER TABLE .+ ADD CONSTRAINT .+ PRIMARY KEY/,
      );
      expect(actualCall).toContain('"workspacetest"."userstable"');
      expect(actualCall).toContain('"PKtest"');
      expect(actualCall).toContain('"idcol"');
      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('users"table');
      expect(actualCall).not.toContain('PK"test');
      expect(actualCall).not.toContain('id"col');
    });
  });

  describe('dropPrimaryKey', () => {
    it('should drop a primary key constraint', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const constraintName = 'PK_users';

      // Act
      await service.dropPrimaryKey(
        mockQueryRunner,
        schemaName,
        tableName,
        constraintName,
      );

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TABLE "workspace_test"."users" DROP CONSTRAINT IF EXISTS "PK_users"`,
      );
    });

    it('should sanitize input parameters', async () => {
      // Prepare
      const schemaName = 'workspace"test';
      const tableName = 'users"table';
      const constraintName = 'PK"test';

      // Act
      await service.dropPrimaryKey(
        mockQueryRunner,
        schemaName,
        tableName,
        constraintName,
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toMatch(/ALTER TABLE .+ DROP CONSTRAINT IF EXISTS/);
      expect(actualCall).toContain('"workspacetest"."userstable"');
      expect(actualCall).toContain('"PKtest"');
      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('users"table');
      expect(actualCall).not.toContain('PK"test');
    });
  });

  describe('createUniqueConstraint', () => {
    it('should create a unique constraint', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const constraintName = 'UQ_users_email';
      const columnNames = ['email'];

      // Act
      await service.createUniqueConstraint(
        mockQueryRunner,
        schemaName,
        tableName,
        constraintName,
        columnNames,
      );

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TABLE "workspace_test"."users" ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")`,
      );
    });

    it('should create composite unique constraint', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const constraintName = 'UQ_users_email_company';
      const columnNames = ['email', 'companyId'];

      // Act
      await service.createUniqueConstraint(
        mockQueryRunner,
        schemaName,
        tableName,
        constraintName,
        columnNames,
      );

      // Assert
      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toContain('UNIQUE ("email", "companyId")');
    });

    it('should sanitize input parameters', async () => {
      const schemaName = 'workspace"test';
      const tableName = 'users"table';
      const constraintName = 'UQ"test';
      const columnNames = ['email"col'];

      await service.createUniqueConstraint(
        mockQueryRunner,
        schemaName,
        tableName,
        constraintName,
        columnNames,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toMatch(/ALTER TABLE .+ ADD CONSTRAINT .+ UNIQUE/);
      expect(actualCall).toContain('"workspacetest"."userstable"');
      expect(actualCall).toContain('"UQtest"');
      expect(actualCall).toContain('"emailcol"');

      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('users"table');
      expect(actualCall).not.toContain('UQ"test');
      expect(actualCall).not.toContain('email"col');
    });
  });

  describe('dropUniqueConstraint', () => {
    it('should drop a unique constraint', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';
      const constraintName = 'UQ_users_email';

      // Act
      await service.dropUniqueConstraint(
        mockQueryRunner,
        schemaName,
        tableName,
        constraintName,
      );

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `ALTER TABLE "workspace_test"."users" DROP CONSTRAINT IF EXISTS "UQ_users_email"`,
      );
    });

    it('should sanitize input parameters', async () => {
      const schemaName = 'workspace"test';
      const tableName = 'users"table';
      const constraintName = 'UQ"test';

      await service.dropUniqueConstraint(
        mockQueryRunner,
        schemaName,
        tableName,
        constraintName,
      );

      const actualCall = mockQueryRunner.query.mock.calls[0][0];

      expect(actualCall).toMatch(/ALTER TABLE .+ DROP CONSTRAINT IF EXISTS/);
      expect(actualCall).toContain('"workspacetest"."userstable"');
      expect(actualCall).toContain('"UQtest"');

      expect(actualCall).not.toContain('workspace"test');
      expect(actualCall).not.toContain('users"table');
      expect(actualCall).not.toContain('UQ"test');
    });
  });
});
