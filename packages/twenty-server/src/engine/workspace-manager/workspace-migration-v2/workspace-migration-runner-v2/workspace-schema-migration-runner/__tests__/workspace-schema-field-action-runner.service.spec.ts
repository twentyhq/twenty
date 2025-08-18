import { FieldMetadataType } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceSchemaFieldActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-field-action-runner.service';

describe('WorkspaceSchemaFieldActionRunner', () => {
  let service: WorkspaceSchemaFieldActionRunnerService;
  let mockSchemaManagerService: jest.Mocked<WorkspaceSchemaManagerService>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  const mockWorkspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const mockSchemaName = getWorkspaceSchemaName(mockWorkspaceId);
  const mockObjectMetadataId = '20202020-1c25-4d02-bf25-6aeccf7ea418';
  const mockFieldMetadataId = '20202020-1c25-4d02-bf25-6aeccf7ea417';

  const createMockFlatObjectMetadataMaps = (
    objectMetadata: any,
    fieldMetadata: any,
  ) => ({
    byId: {
      [mockObjectMetadataId]: {
        ...objectMetadata,
        fieldsById: {
          [mockFieldMetadataId]: fieldMetadata,
        },
      },
    },
    idByNameSingular: {
      [objectMetadata.nameSingular]: mockObjectMetadataId,
    },
  });

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

    service = new WorkspaceSchemaFieldActionRunnerService(
      mockSchemaManagerService,
    );
  });

  describe('DELETE Field Migration', () => {
    it('should properly delete composite ADDRESS fields with all sub-columns', async () => {
      const addressField = getFlatFieldMetadataMock({
        id: mockFieldMetadataId,
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.ADDRESS,
        name: 'homeAddress',
        uniqueIdentifier: 'homeAddress',
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'person',
        uniqueIdentifier: 'person',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        addressField,
      );

      await service.runDeleteFieldSchemaMigration({
        action: {
          type: 'delete_field',
          fieldMetadataId: mockFieldMetadataId,
          objectMetadataId: mockObjectMetadataId,
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // All 8 ADDRESS composite columns must be dropped
      expect(
        mockSchemaManagerService.columnManager.dropColumns,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_person',
        columnNames: [
          'homeAddressAddressStreet1',
          'homeAddressAddressStreet2',
          'homeAddressAddressCity',
          'homeAddressAddressPostcode',
          'homeAddressAddressState',
          'homeAddressAddressCountry',
          'homeAddressAddressLat',
          'homeAddressAddressLng',
        ],
      });

      // No enum operations should be performed for ADDRESS fields
      expect(
        mockSchemaManagerService.enumManager.dropEnum,
      ).not.toHaveBeenCalled();
    });

    it('should properly delete SELECT fields with enum cleanup', async () => {
      const selectField = getFlatFieldMetadataMock({
        id: mockFieldMetadataId,
        objectMetadataId: mockObjectMetadataId,
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
        uniqueIdentifier: 'status',
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'person',
        uniqueIdentifier: 'person',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        selectField,
      );

      await service.runDeleteFieldSchemaMigration({
        action: {
          type: 'delete_field',
          fieldMetadataId: mockFieldMetadataId,
          objectMetadataId: mockObjectMetadataId,
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Column must be dropped first
      expect(
        mockSchemaManagerService.columnManager.dropColumns,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_person',
        columnNames: ['status'],
      });

      // Enum type must be properly cleaned up
      expect(
        mockSchemaManagerService.enumManager.dropEnum,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        enumName: '_person_status_enum',
      });
    });

    it('should properly delete RELATION fields with foreign key cleanup', async () => {
      const relationField = getFlatFieldMetadataMock({
        id: mockFieldMetadataId,
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.RELATION,
        name: 'company',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          joinColumnName: 'companyId',
        },
        uniqueIdentifier: 'company',
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'person',
        uniqueIdentifier: 'person',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        relationField,
      );

      await service.runDeleteFieldSchemaMigration({
        action: {
          type: 'delete_field',
          fieldMetadataId: mockFieldMetadataId,
          objectMetadataId: mockObjectMetadataId,
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Foreign key column must be dropped
      expect(
        mockSchemaManagerService.columnManager.dropColumns,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_person',
        columnNames: ['companyId'],
      });

      // No enum operations for relation fields
      expect(
        mockSchemaManagerService.enumManager.dropEnum,
      ).not.toHaveBeenCalled();
    });
  });

  describe('CREATE Field Migration', () => {
    it('should create SELECT fields with proper enum-first ordering', async () => {
      const selectField = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'priority',
        options: [
          { id: '1', value: 'HIGH', label: 'High', color: 'red', position: 0 },
          { id: '2', value: 'LOW', label: 'Low', color: 'blue', position: 1 },
        ],
        uniqueIdentifier: 'priority',
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'task',
        uniqueIdentifier: 'task',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        selectField,
      );

      await service.runCreateFieldSchemaMigration({
        action: {
          type: 'create_field',
          flatFieldMetadata: selectField,
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Enum must be created BEFORE column that depends on it
      const enumCreateMock = mockSchemaManagerService.enumManager
        .createEnum as unknown as jest.Mock;
      const addColumnsMock = mockSchemaManagerService.columnManager
        .addColumns as unknown as jest.Mock;

      const allCalls = [
        ...enumCreateMock.mock.calls.map((call: unknown[]) => ({
          type: 'enum',
          call,
        })),
        ...addColumnsMock.mock.calls.map((call: unknown[]) => ({
          type: 'column',
          call,
        })),
      ];

      expect(allCalls).toHaveLength(2);
      expect(allCalls[0].type).toBe('enum');
      expect(allCalls[1].type).toBe('column');

      // Enum creation with correct parameters
      expect(
        mockSchemaManagerService.enumManager.createEnum,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        enumName: '_task_priority_enum',
        values: ['HIGH', 'LOW'],
      });

      // Column creation with enum reference
      expect(
        mockSchemaManagerService.columnManager.addColumns,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_task',
        columnDefinitions: [
          {
            name: 'priority',
            type: `"${mockSchemaName}"."_task_priority_enum"`,
            isNullable: true,
            isArray: false,
            isUnique: false,
            default: null,
          },
        ],
      });
    });

    it('should create CURRENCY composite fields with proper column generation', async () => {
      const currencyField = getFlatFieldMetadataMock({
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.CURRENCY,
        name: 'salary',
        defaultValue: {
          amountMicros: '5000000000',
          currencyCode: 'USD',
        },
        uniqueIdentifier: 'salary',
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'employee',
        uniqueIdentifier: 'employee',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        currencyField,
      );

      await service.runCreateFieldSchemaMigration({
        action: {
          type: 'create_field',
          flatFieldMetadata: currencyField,
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // No enum operations for composite fields
      expect(
        mockSchemaManagerService.enumManager.createEnum,
      ).not.toHaveBeenCalled();

      // Both composite columns must be created
      expect(
        mockSchemaManagerService.columnManager.addColumns,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_employee',
        columnDefinitions: [
          {
            name: 'salaryAmountMicros',
            type: 'numeric',
            isNullable: true,
            isUnique: false,
            default: '5000000000',
            isArray: false,
          },
          {
            name: 'salaryCurrencyCode',
            type: 'text',
            isNullable: true,
            isUnique: false,
            default: 'USD',
            isArray: false,
          },
        ],
      });
    });
  });

  describe('UPDATE Field Migration', () => {
    it('should handle field name updates with composite field column renaming', async () => {
      const addressField = getFlatFieldMetadataMock({
        id: mockFieldMetadataId,
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.ADDRESS,
        name: 'oldAddress',
        uniqueIdentifier: 'oldAddress',
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'company',
        uniqueIdentifier: 'company',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        addressField,
      );

      await service.runUpdateFieldSchemaMigration({
        action: {
          type: 'update_field',
          workspaceId: mockWorkspaceId,
          fieldMetadataId: mockFieldMetadataId,
          objectMetadataId: mockObjectMetadataId,
          updates: [
            {
              property: 'name',
              from: 'oldAddress',
              to: 'newAddress',
            },
          ],
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // All 8 ADDRESS composite columns must be renamed
      const expectedRenameCalls = [
        ['oldAddressAddressStreet1', 'newAddressAddressStreet1'],
        ['oldAddressAddressStreet2', 'newAddressAddressStreet2'],
        ['oldAddressAddressCity', 'newAddressAddressCity'],
        ['oldAddressAddressPostcode', 'newAddressAddressPostcode'],
        ['oldAddressAddressState', 'newAddressAddressState'],
        ['oldAddressAddressCountry', 'newAddressAddressCountry'],
        ['oldAddressAddressLat', 'newAddressAddressLat'],
        ['oldAddressAddressLng', 'newAddressAddressLng'],
      ];

      expect(
        mockSchemaManagerService.columnManager.renameColumn,
      ).toHaveBeenCalledTimes(8);

      expectedRenameCalls.forEach(([fromName, toName]) => {
        expect(
          mockSchemaManagerService.columnManager.renameColumn,
        ).toHaveBeenCalledWith({
          queryRunner: mockQueryRunner,
          schemaName: mockSchemaName,
          tableName: '_company',
          oldColumnName: fromName,
          newColumnName: toName,
        });
      });
    });

    it('should handle enum field option updates with proper value mapping', async () => {
      const selectField = getFlatFieldMetadataMock({
        id: mockFieldMetadataId,
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'status',
        options: [
          {
            id: '1',
            value: 'UPDATED_ACTIVE',
            label: 'Updated Active',
            color: 'green',
            position: 0,
          },
          {
            id: '2',
            value: 'UPDATED_INACTIVE',
            label: 'Updated Inactive',
            color: 'red',
            position: 1,
          },
        ],
        uniqueIdentifier: 'status',
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'person',
        uniqueIdentifier: 'person',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        selectField,
      );

      await service.runUpdateFieldSchemaMigration({
        action: {
          type: 'update_field',
          workspaceId: mockWorkspaceId,
          fieldMetadataId: mockFieldMetadataId,
          objectMetadataId: mockObjectMetadataId,
          updates: [
            {
              property: 'options',
              from: [
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
              to: [
                {
                  id: '1',
                  value: 'UPDATED_ACTIVE',
                  label: 'Updated Active',
                  color: 'green',
                  position: 0,
                },
                {
                  id: '2',
                  value: 'UPDATED_INACTIVE',
                  label: 'Updated Inactive',
                  color: 'red',
                  position: 1,
                },
              ],
            },
          ],
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Enum values must be updated with proper mapping
      expect(
        mockSchemaManagerService.enumManager.alterEnumValues,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_person',
        enumValues: ['UPDATED_ACTIVE', 'UPDATED_INACTIVE'],
        columnDefinition: {
          name: 'status',
          type: `"${mockSchemaName}"."_person_status_enum"`,
          isNullable: true,
          isArray: false,
          isUnique: false,
          default: null,
        },
        oldToNewEnumOptionMap: {
          ACTIVE: 'UPDATED_ACTIVE', // Keep original values
          INACTIVE: 'UPDATED_INACTIVE',
        },
      });
    });

    it('should handle default value updates for composite fields', async () => {
      const currencyField = getFlatFieldMetadataMock({
        id: mockFieldMetadataId,
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.CURRENCY,
        name: 'price',
        defaultValue: {
          amountMicros: "'0'",
          currencyCode: "'USD'",
        },
        uniqueIdentifier: 'price',
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'product',
        uniqueIdentifier: 'product',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        currencyField,
      );

      await service.runUpdateFieldSchemaMigration({
        action: {
          type: 'update_field',
          workspaceId: mockWorkspaceId,
          fieldMetadataId: mockFieldMetadataId,
          objectMetadataId: mockObjectMetadataId,
          updates: [
            {
              property: 'defaultValue',
              from: {
                amountMicros: "'0'",
                currencyCode: "'USD'",
              },
              to: {
                amountMicros: "'100000000'",
                currencyCode: "'EUR'",
              },
            },
          ],
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Both composite column defaults must be updated
      expect(
        mockSchemaManagerService.columnManager.alterColumnDefault,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_product',
        columnName: 'priceAmountMicros',
        defaultValue: '100000000',
      });

      expect(
        mockSchemaManagerService.columnManager.alterColumnDefault,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_product',
        columnName: 'priceCurrencyCode',
        defaultValue: 'EUR',
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle fields with no join column settings gracefully', async () => {
      const relationFieldWithoutSettings = getFlatFieldMetadataMock({
        id: mockFieldMetadataId,
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.RELATION,
        name: 'company',
        settings: undefined,
        uniqueIdentifier: 'company',
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'person',
        uniqueIdentifier: 'person',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        relationFieldWithoutSettings,
      );

      await service.runDeleteFieldSchemaMigration({
        action: {
          type: 'delete_field',
          fieldMetadataId: mockFieldMetadataId,
          objectMetadataId: mockObjectMetadataId,
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Should not attempt to drop columns for relations without join columns
      expect(
        mockSchemaManagerService.columnManager.dropColumns,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        tableName: '_person',
        columnNames: [], // Empty array - no columns to drop
      });
    });

    it('should handle enum fields without options safely', async () => {
      const selectFieldWithoutOptions = getFlatFieldMetadataMock({
        id: mockFieldMetadataId,
        objectMetadataId: mockObjectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'emptyStatus',
        options: [],
        uniqueIdentifier: 'emptyStatus',
      });

      const objectMetadata = getFlatObjectMetadataMock({
        id: mockObjectMetadataId,
        workspaceId: mockWorkspaceId,
        nameSingular: 'test',
        uniqueIdentifier: 'test',
      });

      const flatObjectMetadataMaps = createMockFlatObjectMetadataMaps(
        objectMetadata,
        selectFieldWithoutOptions,
      );

      await service.runCreateFieldSchemaMigration({
        action: {
          type: 'create_field',
          flatFieldMetadata: selectFieldWithoutOptions,
        },
        queryRunner: mockQueryRunner,
        flatObjectMetadataMaps,
      });

      // Should still create enum even with empty values
      expect(
        mockSchemaManagerService.enumManager.createEnum,
      ).toHaveBeenCalledWith({
        queryRunner: mockQueryRunner,
        schemaName: mockSchemaName,
        enumName: '_test_emptyStatus_enum',
        values: [], // Empty enum values array
      });
    });
  });
});
