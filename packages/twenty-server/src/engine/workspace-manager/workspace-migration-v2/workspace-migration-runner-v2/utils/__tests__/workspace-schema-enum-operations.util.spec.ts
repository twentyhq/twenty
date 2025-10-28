import { FieldMetadataType } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/exceptions/workspace-migration-runner.exception';
import {
  collectEnumOperationsForField,
  EnumOperation,
  type EnumOperationSpec,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/workspace-schema-enum-operations.util';

describe('WorkspaceSchemaEnumOperations', () => {
  let mockSchemaManagerService: jest.Mocked<WorkspaceSchemaManagerService>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    mockSchemaManagerService = {
      enumManager: {
        createEnum: jest.fn(),
        dropEnum: jest.fn(),
        renameEnum: jest.fn(),
        alterEnumValues: jest.fn(),
      },
    } as any;

    mockQueryRunner = {} as any;
  });

  describe('Batch Operation Atomicity', () => {
    it('should fail fast when any enum operation fails to preserve transaction integrity', async () => {
      const enumOperations: EnumOperationSpec[] = [
        {
          operation: EnumOperation.CREATE,
          enumName: 'enum1',
          values: ['A', 'B'],
        },
        {
          operation: EnumOperation.CREATE,
          enumName: 'enum2',
          values: ['X', 'Y'],
        },
        {
          operation: EnumOperation.CREATE,
          enumName: 'enum3',
          values: ['P', 'Q'],
        },
      ];

      // Simulate failure on second enum
      (mockSchemaManagerService.enumManager.createEnum as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Enum collision'))
        .mockResolvedValueOnce(undefined);

      await expect(
        executeBatchEnumOperations({
          enumOperations,
          queryRunner: mockQueryRunner,
          schemaName: 'test_schema',
          workspaceSchemaManagerService: mockSchemaManagerService,
        }),
      ).rejects.toThrow(WorkspaceMigrationRunnerException);

      // All operations should be attempted in parallel despite failure
      expect(
        mockSchemaManagerService.enumManager.createEnum,
      ).toHaveBeenCalledTimes(3);
    });

    it('should handle empty operations without unnecessary database calls', async () => {
      await executeBatchEnumOperations({
        enumOperations: [],
        queryRunner: mockQueryRunner,
        schemaName: 'test_schema',
        workspaceSchemaManagerService: mockSchemaManagerService,
      });

      expect(
        mockSchemaManagerService.enumManager.createEnum,
      ).not.toHaveBeenCalled();
    });
  });

  describe('Enum Collection for SELECT Fields', () => {
    it('should collect enum operations for simple SELECT fields', () => {
      const selectField = getFlatFieldMetadataMock({
        universalIdentifier: 'status',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.SELECT,
        name: 'status',
        options: [
          {
            id: '1',
            value: 'ACTIVE',
            label: 'Active',
            color: 'green',
            position: 0,
          },
          {
            id: '2',
            value: 'INACTIVE',
            label: 'Inactive',
            color: 'red',
            position: 1,
          },
        ],
      });

      const enumOps = collectEnumOperationsForField({
        flatFieldMetadata: selectField,
        tableName: 'contacts',
        operation: EnumOperation.CREATE,
      });

      expect(enumOps).toMatchObject([
        {
          enumName: expect.stringContaining('contacts_status_enum'),
          values: ['ACTIVE', 'INACTIVE'],
        },
      ]);
    });

    it('should collect enum operations for MULTI_SELECT fields', () => {
      const multiSelectField = getFlatFieldMetadataMock({
        universalIdentifier: 'tags',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.MULTI_SELECT,
        name: 'tags',
        options: [
          {
            id: '1',
            value: 'URGENT',
            label: 'Urgent',
            color: 'red',
            position: 0,
          },
          {
            id: '2',
            value: 'LOW_PRIORITY',
            label: 'Low Priority',
            color: 'blue',
            position: 1,
          },
        ],
      });

      const enumOps = collectEnumOperationsForField({
        flatFieldMetadata: multiSelectField,
        tableName: 'tasks',
        operation: EnumOperation.CREATE,
      });

      expect(enumOps).toMatchObject([
        {
          enumName: expect.stringContaining('tasks_tags_enum'),
          values: ['URGENT', 'LOW_PRIORITY'],
        },
      ]);
    });

    it('should handle field renaming with proper enum name mapping', () => {
      const selectField = getFlatFieldMetadataMock({
        universalIdentifier: 'status',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.SELECT,
        name: 'oldStatus',
      });

      const enumOps = collectEnumOperationsForField({
        flatFieldMetadata: selectField,
        tableName: 'contacts',
        operation: EnumOperation.RENAME,
        options: { newFieldName: 'newStatus' },
      });

      expect(enumOps).toMatchObject([
        {
          fromName: expect.stringContaining('contacts_oldStatus_enum'),
          toName: expect.stringContaining('contacts_newStatus_enum'),
        },
      ]);
    });
  });

  describe('Composite Field Enum Handling', () => {
    it('should handle composite fields that do not currently generate enum operations', () => {
      const addressField = getFlatFieldMetadataMock({
        universalIdentifier: 'address',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.ADDRESS,
        name: 'primaryAddress',
      });

      const enumOps = collectEnumOperationsForField({
        flatFieldMetadata: addressField,
        tableName: 'contacts',
        operation: EnumOperation.CREATE,
      });

      // Current implementation doesn't handle composite enum fields
      expect(enumOps).toEqual([]);
    });

    it('should skip relation properties in composite types', () => {
      const relationField = getFlatFieldMetadataMock({
        universalIdentifier: 'relation',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.RELATION,
        name: 'company',
      });

      const enumOps = collectEnumOperationsForField({
        flatFieldMetadata: relationField,
        tableName: 'contacts',
        operation: EnumOperation.CREATE,
      });

      // Relation fields should not generate enum operations
      expect(enumOps).toEqual([]);
    });
  });

  describe('Non-Enum Field Safety', () => {
    it('should return empty operations for non-enum fields', () => {
      const textField = getFlatFieldMetadataMock({
        universalIdentifier: 'description',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.TEXT,
        name: 'description',
      });

      const enumOps = collectEnumOperationsForField({
        flatFieldMetadata: textField,
        tableName: 'contacts',
        operation: EnumOperation.CREATE,
      });

      expect(enumOps).toEqual([]);
    });
  });
});
