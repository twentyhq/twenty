import { Test, type TestingModule } from '@nestjs/testing';

import { type QueryRunner } from 'typeorm';

import { WorkspaceSchemaColumnManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-column-manager.service';
import { WorkspaceSchemaEnumManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-enum-manager.service';
import { WorkspaceSchemaForeignKeyManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-foreign-key-manager.service';
import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';
import { WorkspaceSchemaTableManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-table-manager.service';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';

describe('WorkspaceSchemaManager', () => {
  let service: WorkspaceSchemaManagerService;
  let mockQueryRunner: jest.Mocked<QueryRunner>;
  let tableManager: jest.Mocked<WorkspaceSchemaTableManagerService>;
  let columnManager: jest.Mocked<WorkspaceSchemaColumnManagerService>;
  let indexManager: jest.Mocked<WorkspaceSchemaIndexManagerService>;
  let enumManager: jest.Mocked<WorkspaceSchemaEnumManagerService>;
  let foreignKeyManager: jest.Mocked<WorkspaceSchemaForeignKeyManagerService>;

  beforeEach(async () => {
    // Prepare
    tableManager = {
      createTable: jest.fn(),
      dropTable: jest.fn(),
      renameTable: jest.fn(),
      tableExists: jest.fn(),
    } as any;

    columnManager = {
      addColumns: jest.fn(),
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
        WorkspaceSchemaManagerService,
        { provide: WorkspaceSchemaTableManagerService, useValue: tableManager },
        {
          provide: WorkspaceSchemaColumnManagerService,
          useValue: columnManager,
        },
        { provide: WorkspaceSchemaIndexManagerService, useValue: indexManager },
        { provide: WorkspaceSchemaEnumManagerService, useValue: enumManager },
        {
          provide: WorkspaceSchemaForeignKeyManagerService,
          useValue: foreignKeyManager,
        },
      ],
    }).compile();

    service = module.get<WorkspaceSchemaManagerService>(
      WorkspaceSchemaManagerService,
    );
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

  describe('manager access', () => {
    it('should provide access to table manager', () => {
      // Act & Assert
      expect(service.tableManager).toBeInstanceOf(Object);
      expect(service.tableManager.createTable).toBeDefined();
    });

    it('should provide access to column manager', () => {
      // Act & Assert
      expect(service.columnManager).toBeInstanceOf(Object);
      expect(service.columnManager.addColumns).toBeDefined();
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
      await service.tableManager.createTable({
        queryRunner: mockQueryRunner,
        schemaName,
        tableName,
        columnDefinitions: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'status', type: 'varchar' },
        ],
      });

      await service.enumManager.createEnum({
        queryRunner: mockQueryRunner,
        schemaName,
        enumName: 'user_status_enum',
        values: ['ACTIVE', 'INACTIVE'],
      });

      await service.indexManager.createIndex({
        queryRunner: mockQueryRunner,
        schemaName,
        tableName,
        index: {
          name: 'idx_users_name',
          columns: ['name'],
        },
      });

      // Assert
      expect(tableManager.createTable).toHaveBeenCalled();
      expect(enumManager.createEnum).toHaveBeenCalled();
      expect(indexManager.createIndex).toHaveBeenCalled();
    });
  });
});
