import { FieldMetadataType } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceSchemaObjectActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-object-action-runner.service';

describe('WorkspaceSchemaObjectActionRunner', () => {
  let service: WorkspaceSchemaObjectActionRunnerService;
  let mockSchemaManagerService: jest.Mocked<WorkspaceSchemaManagerService>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  const mockWorkspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const mockObjectMetadataId = '20202020-1c25-4d02-bf25-6aeccf7ea418';
  const mockSchemaName = getWorkspaceSchemaName(mockWorkspaceId);

  const createMockFlatObjectMetadataMaps = (
    objectMetadata: any,
    fields: any[] = [],
  ) => {
    const fieldsById = fields.reduce((acc, field, index) => {
      const fieldId = `field-${index}`;

      acc[fieldId] = { ...field, id: fieldId };

      return acc;
    }, {});

    return {
      byId: {
        [mockObjectMetadataId]: {
          ...objectMetadata,
          fieldsById,
        },
      },
      idByNameSingular: {
        [objectMetadata.nameSingular]: mockObjectMetadataId,
      },
    };
  };

  beforeEach(() => {
    mockSchemaManagerService = {
      columnManager: {
        dropColumns: jest.fn(),
        addColumns: jest.fn(),
        renameColumn: jest.fn(),
        alterColumnDefault: jest.fn(),
      },
      enumManager: {
        createEnum: jest.fn(),
        dropEnum: jest.fn(),
        renameEnum: jest.fn(),
        alterEnumValues: jest.fn(),
      },
      tableManager: {
        createTable: jest.fn(),
        dropTable: jest.fn(),
        renameTable: jest.fn(),
      },
    } as any;

    mockQueryRunner = {} as any;

    service = new WorkspaceSchemaObjectActionRunnerService(
      mockSchemaManagerService,
    );
  });

  describe('DELETE Object Migration', () => {
    it('should properly delete objects with SELECT field enum cleanup', async () => {
      const selectField1 = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'status',
        uniqueIdentifier: 'status',
        options: [
          {
            id: '1',
            value: 'ACTIVE',
            label: 'Active',
            color: 'green',
            position: 0,
          },
        ],
      });

      const selectField2 = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'priority',
        uniqueIdentifier: 'priority',
        options: [
          { id: '1', value: 'HIGH', label: 'High', color: 'red', position: 0 },
        ],
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'task',
        uniqueIdentifier: 'task',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        [selectField1, selectField2],
      );

      await service.runDeleteObjectSchemaMigration({
        action: {
          type: 'delete_object',
          objectMetadataId: mockObjectMetadataId,
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Table must be dropped first
      expect(
        mockSchemaManagerService.tableManager.dropTable,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_task',
      });

      // All enum types associated with the object must be cleaned up
      expect(
        mockSchemaManagerService.enumManager.dropEnum,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockSchemaManagerService.enumManager.dropEnum,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        enumName: '_task_status_enum',
      });
      expect(
        mockSchemaManagerService.enumManager.dropEnum,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        enumName: '_task_priority_enum',
      });
    });

    it('should handle object deletion with mixed field types', async () => {
      const textField = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.TEXT,
        name: 'description',
        uniqueIdentifier: 'description',
      });

      const addressField = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.ADDRESS,
        name: 'location',
        uniqueIdentifier: 'location',
      });

      const multiSelectField = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.MULTI_SELECT,
        name: 'tags',
        uniqueIdentifier: 'tags',
        options: [
          {
            id: '1',
            value: 'URGENT',
            label: 'Urgent',
            color: 'red',
            position: 0,
          },
        ],
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'project',
        uniqueIdentifier: 'project',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        [textField, addressField, multiSelectField],
      );

      await service.runDeleteObjectSchemaMigration({
        action: {
          type: 'delete_object',
          objectMetadataId: mockObjectMetadataId,
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Table must be dropped
      expect(
        mockSchemaManagerService.tableManager.dropTable,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_project',
      });

      // Only enum fields should trigger enum cleanup
      expect(
        mockSchemaManagerService.enumManager.dropEnum,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockSchemaManagerService.enumManager.dropEnum,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        enumName: '_project_tags_enum',
      });
    });

    it('should handle object deletion with no enum fields', async () => {
      const textField = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.TEXT,
        name: 'name',
        uniqueIdentifier: 'name',
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'simpleObject',
        uniqueIdentifier: 'simpleObject',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        [textField],
      );

      await service.runDeleteObjectSchemaMigration({
        action: {
          type: 'delete_object',
          objectMetadataId: mockObjectMetadataId,
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Table must be dropped
      expect(
        mockSchemaManagerService.tableManager.dropTable,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_simpleObject',
      });

      // No enum cleanup should occur
      expect(
        mockSchemaManagerService.enumManager.dropEnum,
      ).not.toHaveBeenCalled();
    });
  });

  describe('CREATE Object Migration', () => {
    it('should create objects with mixed field types and proper column generation', async () => {
      const textFieldAction = {
        type: 'create_field' as const,
        flatFieldMetadata: getFlatFieldMetadataMock({
          objectMetadataId: mockObjectMetadataId,
          type: FieldMetadataType.TEXT,
          name: 'title',
          uniqueIdentifier: 'title',
        }),
      };

      const selectFieldAction = {
        type: 'create_field' as const,
        flatFieldMetadata: getFlatFieldMetadataMock({
          objectMetadataId: mockObjectMetadataId,
          type: FieldMetadataType.SELECT,
          name: 'status',
          uniqueIdentifier: 'status',
          options: [
            {
              id: '1',
              value: 'DRAFT',
              label: 'Draft',
              color: 'gray',
              position: 0,
            },
            {
              id: '2',
              value: 'PUBLISHED',
              label: 'Published',
              color: 'green',
              position: 1,
            },
          ],
        }),
      };

      const currencyFieldAction = {
        type: 'create_field' as const,
        flatFieldMetadata: getFlatFieldMetadataMock({
          objectMetadataId: mockObjectMetadataId,
          type: FieldMetadataType.CURRENCY,
          name: 'price',
          uniqueIdentifier: 'price',
        }),
      };

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'article',
        uniqueIdentifier: 'article',
      });

      await service.runCreateObjectSchemaMigration({
        action: {
          type: 'create_object',
          flatObjectMetadataWithoutFields: objectMetadata,
          createFieldActions: [
            textFieldAction,
            selectFieldAction,
            currencyFieldAction,
          ],
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps: {
          byId: {
            [mockObjectMetadataId]: {
              ...objectMetadata,
              fieldsById: {},
              fieldIdByJoinColumnName: {},
              fieldIdByName: {},
            },
          },
          idByNameSingular: {
            [objectMetadata.nameSingular]: mockObjectMetadataId,
          },
        },
      });

      // Table must be created with all field columns and enums
      expect(
        mockSchemaManagerService.tableManager.createTable,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_article',
        columnDefinitions: [
          // TEXT field column
          {
            name: 'title',
            type: 'text',
            isNullable: true,
            isArray: false,
            isUnique: false,
            default: null,
          },
          // SELECT field column
          {
            name: 'status',
            type: `"${mockSchemaName}"."_article_status_enum"`,
            isNullable: true,
            isArray: false,
            isUnique: false,
            default: null,
          },
          // CURRENCY field columns (2 composite columns)
          {
            name: 'priceAmountMicros',
            type: 'numeric',
            isNullable: true,
            isArray: false,
            isUnique: false,
            default: null,
          },
          {
            name: 'priceCurrencyCode',
            type: 'text',
            isNullable: true,
            isArray: false,
            isUnique: false,
            default: null,
          },
        ],
      });

      expect(
        mockSchemaManagerService.enumManager.createEnum,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        enumName: '_article_status_enum',
        values: ['DRAFT', 'PUBLISHED'],
      });
    });

    it('should handle object creation with ADDRESS composite fields', async () => {
      const addressFieldAction = {
        type: 'create_field' as const,
        flatFieldMetadata: getFlatFieldMetadataMock({
          objectMetadataId: mockObjectMetadataId,
          type: FieldMetadataType.ADDRESS,
          name: 'headquarters',
          isNullable: false, // Test non-nullable composite field
          uniqueIdentifier: 'headquarters',
        }),
      };

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'company',
        uniqueIdentifier: 'company',
      });

      await service.runCreateObjectSchemaMigration({
        action: {
          type: 'create_object',
          flatObjectMetadataWithoutFields: objectMetadata,
          createFieldActions: [addressFieldAction],
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps: {
          byId: {
            [mockObjectMetadataId]: {
              ...objectMetadata,
              fieldsById: {},
              fieldIdByJoinColumnName: {},
              fieldIdByName: {},
            },
          },
          idByNameSingular: {
            [objectMetadata.nameSingular]: mockObjectMetadataId,
          },
        },
      });

      // Table must be created with all 8 ADDRESS composite columns
      expect(
        mockSchemaManagerService.tableManager.createTable,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_company',
        columnDefinitions: [
          {
            name: 'headquartersAddressStreet1',
            type: 'text',
            isNullable: true,
            isUnique: false,
            default: null,
            isArray: false,
          },
          {
            name: 'headquartersAddressStreet2',
            type: 'text',
            isNullable: true,
            isUnique: false,
            default: null,
            isArray: false,
          },
          {
            name: 'headquartersAddressCity',
            type: 'text',
            isNullable: true,
            isUnique: false,
            default: null,
            isArray: false,
          },
          {
            name: 'headquartersAddressPostcode',
            type: 'text',
            isNullable: true,
            isUnique: false,
            default: null,
            isArray: false,
          },
          {
            name: 'headquartersAddressState',
            type: 'text',
            isNullable: true,
            isUnique: false,
            default: null,
            isArray: false,
          },
          {
            name: 'headquartersAddressCountry',
            type: 'text',
            isNullable: true,
            isUnique: false,
            default: null,
            isArray: false,
          },
          {
            name: 'headquartersAddressLat',
            type: 'numeric',
            isNullable: true,
            isUnique: false,
            default: null,
            isArray: false,
          },
          {
            name: 'headquartersAddressLng',
            type: 'numeric',
            isNullable: true,
            isUnique: false,
            default: null,
            isArray: false,
          },
        ],
      });
    });

    it('should handle object creation with no field actions', async () => {
      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'emptyObject',
        uniqueIdentifier: 'emptyObject',
      });

      await service.runCreateObjectSchemaMigration({
        action: {
          type: 'create_object',
          flatObjectMetadataWithoutFields: objectMetadata,
          createFieldActions: [],
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps: {
          byId: {
            [mockObjectMetadataId]: {
              ...objectMetadata,
              fieldsById: {},
              fieldIdByJoinColumnName: {},
              fieldIdByName: {},
            },
          },
          idByNameSingular: {
            [objectMetadata.nameSingular]: mockObjectMetadataId,
          },
        },
      });

      // Table must be created even with no columns
      expect(
        mockSchemaManagerService.tableManager.createTable,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_emptyObject',
        columnDefinitions: [], // Empty columns array
      });
    });
  });

  describe('UPDATE Object Migration', () => {
    it('should handle object name changes with enum type updates', async () => {
      const selectField = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'category',
        uniqueIdentifier: 'category',
        options: [
          {
            id: '1',
            value: 'TECH',
            label: 'Technology',
            color: 'blue',
            position: 0,
          },
        ],
      });

      const multiSelectField = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.MULTI_SELECT,
        name: 'tags',
        uniqueIdentifier: 'tags',
        options: [
          {
            id: '1',
            value: 'FEATURED',
            label: 'Featured',
            color: 'yellow',
            position: 0,
          },
        ],
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'blogPost',
        uniqueIdentifier: 'blogPost',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        [selectField, multiSelectField],
      );

      await service.runUpdateObjectSchemaMigration({
        action: {
          type: 'update_object',
          objectMetadataId: mockObjectMetadataId,
          updates: [
            {
              property: 'nameSingular',
              from: 'blogPost',
              to: 'article',
            },
          ],
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Table must be renamed
      expect(
        mockSchemaManagerService.tableManager.renameTable,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        oldTableName: '_blogPost',
        newTableName: '_article',
      });

      // All enum types must be renamed to match new table name
      expect(
        mockSchemaManagerService.enumManager.renameEnum,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockSchemaManagerService.enumManager.renameEnum,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        oldEnumName: '_blogPost_category_enum',
        newEnumName: '_article_category_enum',
      });
      expect(
        mockSchemaManagerService.enumManager.renameEnum,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        oldEnumName: '_blogPost_tags_enum',
        newEnumName: '_article_tags_enum',
      });
    });

    it('should handle object name changes with no actual table rename needed', async () => {
      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'person',
        uniqueIdentifier: 'person',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        [],
      );

      await service.runUpdateObjectSchemaMigration({
        action: {
          type: 'update_object',
          objectMetadataId: mockObjectMetadataId,
          updates: [
            {
              property: 'nameSingular',
              from: 'person',
              to: 'person', // Same name - no change needed
            },
          ],
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // No table operations should occur when names are the same
      expect(
        mockSchemaManagerService.tableManager.renameTable,
      ).not.toHaveBeenCalled();
      expect(
        mockSchemaManagerService.enumManager.renameEnum,
      ).not.toHaveBeenCalled();
    });

    it('should handle object updates with complex field combinations', async () => {
      const textField = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.TEXT,
        name: 'description',
        uniqueIdentifier: 'description',
      });

      const selectField = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'status',
        uniqueIdentifier: 'status',
        options: [
          {
            id: '1',
            value: 'ACTIVE',
            label: 'Active',
            color: 'green',
            position: 0,
          },
        ],
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'oldEntity',
        uniqueIdentifier: 'oldEntity',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        [textField, selectField],
      );

      await service.runUpdateObjectSchemaMigration({
        action: {
          type: 'update_object',
          objectMetadataId: mockObjectMetadataId,
          updates: [
            {
              property: 'nameSingular',
              from: 'oldEntity',
              to: 'newEntity',
            },
          ],
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Table rename
      expect(
        mockSchemaManagerService.tableManager.renameTable,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        oldTableName: '_oldEntity',
        newTableName: '_newEntity',
      });

      // Only SELECT field should trigger enum rename
      expect(
        mockSchemaManagerService.enumManager.renameEnum,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockSchemaManagerService.enumManager.renameEnum,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        oldEnumName: '_oldEntity_status_enum',
        newEnumName: '_newEntity_status_enum',
      });
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('should handle objects with undefined fieldsById gracefully', async () => {
      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'testObject',
        uniqueIdentifier: 'testObject',
      });

      // Create maps with undefined fieldsById
      const flatObjectMetadataMaps = {
        byId: {
          [mockObjectMetadataId]: {
            ...objectMetadata,
            fieldsById: undefined as unknown as Record<string, any>,
            fieldIdByJoinColumnName: {},
            fieldIdByName: {},
          },
        },
        idByNameSingular: {
          [objectMetadata.nameSingular]: mockObjectMetadataId,
        },
      };

      await service.runCreateObjectSchemaMigration({
        action: {
          type: 'create_object',
          flatObjectMetadataWithoutFields: objectMetadata,
          createFieldActions: [],
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Should still drop table
      expect(
        mockSchemaManagerService.tableManager.createTable,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_testObject',
        columnDefinitions: [],
      });
    });

    it('should handle empty fieldsById object', async () => {
      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'emptyFieldsObject',
        uniqueIdentifier: 'emptyFieldsObject',
      });

      const flatObjectMetadataMaps = {
        byId: {
          [mockObjectMetadataId]: {
            ...objectMetadata,
            fieldsById: {},
            fieldIdByJoinColumnName: {},
            fieldIdByName: {},
          },
        },
        idByNameSingular: {
          [objectMetadata.nameSingular]: mockObjectMetadataId,
        },
      };

      await service.runUpdateObjectSchemaMigration({
        action: {
          type: 'update_object',
          objectMetadataId: mockObjectMetadataId,
          updates: [
            {
              property: 'nameSingular',
              from: 'emptyFieldsObject',
              to: 'renamedEmptyFieldsObject',
            },
          ],
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Should rename table
      expect(
        mockSchemaManagerService.tableManager.renameTable,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        oldTableName: '_emptyFieldsObject',
        newTableName: '_renamedEmptyFieldsObject',
      });

      // Should not perform enum operations
      expect(
        mockSchemaManagerService.enumManager.renameEnum,
      ).not.toHaveBeenCalled();
    });
  });
});
