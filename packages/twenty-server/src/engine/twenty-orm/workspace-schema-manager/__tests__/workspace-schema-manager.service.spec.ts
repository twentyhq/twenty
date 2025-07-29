import { Test, TestingModule } from '@nestjs/testing';

import { QueryRunner } from 'typeorm';

import {
  WorkspaceSchemaColumnManager,
  WorkspaceSchemaEnumManager,
  WorkspaceSchemaForeignKeyManager,
  WorkspaceSchemaIndexManager,
  WorkspaceSchemaTableManager,
} from 'src/engine/twenty-orm/workspace-schema-manager/services';
import { WorkspaceSchemaManager } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';

describe('WorkspaceSchemaManager', () => {
  let service: WorkspaceSchemaManager;
  let mockQueryRunner: jest.Mocked<QueryRunner>;
  let tableManager: jest.Mocked<WorkspaceSchemaTableManager>;
  let columnManager: jest.Mocked<WorkspaceSchemaColumnManager>;
  let indexManager: jest.Mocked<WorkspaceSchemaIndexManager>;
  let enumManager: jest.Mocked<WorkspaceSchemaEnumManager>;
  let foreignKeyManager: jest.Mocked<WorkspaceSchemaForeignKeyManager>;

  beforeEach(async () => {
    // Prepare
    tableManager = {
      createTable: jest.fn(),
      dropTable: jest.fn(),
      renameTable: jest.fn(),
      tableExists: jest.fn(),
    } as any;

    columnManager = {
      addColumn: jest.fn(),
      dropColumn: jest.fn(),
      renameColumn: jest.fn(),
      columnExists: jest.fn(),
    } as any;

    indexManager = {
      createIndex: jest.fn(),
      dropIndex: jest.fn(),
      indexExists: jest.fn(),
    } as any;

    enumManager = {
      createEnum: jest.fn(),
      dropEnum: jest.fn(),
      alterEnumValues: jest.fn(),
    } as any;

    foreignKeyManager = {
      createForeignKey: jest.fn(),
      dropForeignKey: jest.fn(),
    } as any;

    mockQueryRunner = {
      query: jest.fn(),
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceSchemaManager,
        { provide: WorkspaceSchemaTableManager, useValue: tableManager },
        { provide: WorkspaceSchemaColumnManager, useValue: columnManager },
        { provide: WorkspaceSchemaIndexManager, useValue: indexManager },
        { provide: WorkspaceSchemaEnumManager, useValue: enumManager },
        {
          provide: WorkspaceSchemaForeignKeyManager,
          useValue: foreignKeyManager,
        },
      ],
    }).compile();

    service = module.get<WorkspaceSchemaManager>(WorkspaceSchemaManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize all managers', () => {
      expect(service.tableManager).toBe(tableManager);
      expect(service.columnManager).toBe(columnManager);
      expect(service.indexManager).toBe(indexManager);
      expect(service.enumManager).toBe(enumManager);
      expect(service.foreignKeyManager).toBe(foreignKeyManager);
    });
  });

  describe('setSearchPath', () => {
    it('should set search path with sanitized schema name', async () => {
      // Prepare
      const schemaName = 'workspace_abc123';

      // Act
      await service.setSearchPath(mockQueryRunner, schemaName);

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SET LOCAL search_path TO ${schemaName}`,
      );
    });

    it('should sanitize schema name before setting search path', async () => {
      // Prepare
      const schemaName = 'workspace_abc123; DROP TABLE users; --';
      const expectedSanitizedName = 'workspace_abc123DROPTABLEusers';

      // Act
      await service.setSearchPath(mockQueryRunner, schemaName);

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SET LOCAL search_path TO ${expectedSanitizedName}`,
      );
    });

    it('should handle empty schema name', async () => {
      // Prepare
      const schemaName = '';

      // Act
      await service.setSearchPath(mockQueryRunner, schemaName);

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        'SET LOCAL search_path TO ',
      );
    });
  });

  describe('manager access', () => {
    it('should provide access to table manager', () => {
      // Act & Assert
      expect(service.tableManager).toBeInstanceOf(Object);
      expect(service.tableManager.createTable).toBeDefined();
    });

    it('should provide access to column manager', () => {
      // Act & Assert
      expect(service.columnManager).toBeInstanceOf(Object);
      expect(service.columnManager.addColumn).toBeDefined();
    });

    it('should provide access to index manager', () => {
      // Act & Assert
      expect(service.indexManager).toBeInstanceOf(Object);
      expect(service.indexManager.createIndex).toBeDefined();
    });

    it('should provide access to enum manager', () => {
      // Act & Assert
      expect(service.enumManager).toBeInstanceOf(Object);
      expect(service.enumManager.createEnum).toBeDefined();
    });

    it('should provide access to foreign key manager', () => {
      // Act & Assert
      expect(service.foreignKeyManager).toBeInstanceOf(Object);
      expect(service.foreignKeyManager.createForeignKey).toBeDefined();
    });
  });

  describe('integration scenarios', () => {
    it('should support creating a complete table structure', async () => {
      // Prepare
      const schemaName = 'workspace_test';
      const tableName = 'users';

      // Act
      await service.setSearchPath(mockQueryRunner, schemaName);

      await service.tableManager.createTable(
        mockQueryRunner,
        schemaName,
        tableName,
        [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'status', type: 'varchar' },
        ],
      );

      await service.enumManager.createEnum(
        mockQueryRunner,
        schemaName,
        'user_status_enum',
        ['ACTIVE', 'INACTIVE'],
      );

      await service.indexManager.createIndex(
        mockQueryRunner,
        schemaName,
        tableName,
        {
          name: 'idx_users_name',
          columns: ['name'],
        },
      );

      // Assert
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SET LOCAL search_path TO ${schemaName}`,
      );
      expect(tableManager.createTable).toHaveBeenCalled();
      expect(enumManager.createEnum).toHaveBeenCalled();
      expect(indexManager.createIndex).toHaveBeenCalled();
    });
  });
});
