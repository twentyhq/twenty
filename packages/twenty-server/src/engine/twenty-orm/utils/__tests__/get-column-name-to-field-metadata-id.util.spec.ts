import { FieldMetadataType } from 'twenty-shared/types';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/twenty-orm/utils/get-column-name-to-field-metadata-id.util';

describe('getColumnNameToFieldMetadataIdMap', () => {
  const createMockObjectMetadataItemWithFieldMaps = (
    fieldsById: Record<string, any>,
  ): ObjectMetadataItemWithFieldMaps =>
    ({
      id: 'test-object-id',
      nameSingular: 'test',
      namePlural: 'tests',
      labelSingular: 'Test',
      labelPlural: 'Tests',
      description: 'Test object',
      icon: 'IconTest',
      targetTableName: 'test',
      isCustom: false,
      isRemote: false,
      isActive: true,
      isSystem: false,
      isAuditLogged: false,
      isSearchable: false,
      labelIdentifierFieldMetadataId: '',
      imageIdentifierFieldMetadataId: '',
      workspaceId: 'test-workspace-id',
      indexMetadatas: [],
      fieldsById,
      fieldIdByName: {},
      fieldIdByJoinColumnName: {},
    }) as unknown as ObjectMetadataItemWithFieldMaps;

  const createMockFieldMetadata = (
    id: string,
    name: string,
    type: FieldMetadataType,
  ) => ({
    id,
    name,
    type,
    label: name,
    objectMetadataId: 'test-object-id',
    isLabelSyncedWithName: true,
    isNullable: true,
    isUnique: false,
    workspaceId: 'test-workspace-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('with simple field types', () => {
    it('should return a map with column name to field metadata id for simple field types', () => {
      const fieldsById = {
        'field-1': createMockFieldMetadata(
          'field-1',
          'name',
          FieldMetadataType.TEXT,
        ),
        'field-2': createMockFieldMetadata(
          'field-2',
          'age',
          FieldMetadataType.NUMBER,
        ),
      };

      const objectMetadataItemWithFieldMaps =
        createMockObjectMetadataItemWithFieldMaps(fieldsById);

      const result = getColumnNameToFieldMetadataIdMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result['name']).toBe('field-1');
      expect(result['age']).toBe('field-2');
      expect(Object.keys(result)).toHaveLength(2);
    });
  });

  describe('with composite field types', () => {
    it('should return column names to field metadata id for FULL_NAME composite type', () => {
      const fieldsById = {
        'field-1': createMockFieldMetadata(
          'field-1',
          'fullName',
          FieldMetadataType.FULL_NAME,
        ),
      };

      const objectMetadataItemWithFieldMaps =
        createMockObjectMetadataItemWithFieldMaps(fieldsById);

      const result = getColumnNameToFieldMetadataIdMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result['fullNameFirstName']).toBe('field-1');
      expect(result['fullNameLastName']).toBe('field-1');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should return column names to field metadata id for CURRENCY composite type', () => {
      const fieldsById = {
        'field-1': createMockFieldMetadata(
          'field-1',
          'price',
          FieldMetadataType.CURRENCY,
        ),
      };

      const objectMetadataItemWithFieldMaps =
        createMockObjectMetadataItemWithFieldMaps(fieldsById);

      const result = getColumnNameToFieldMetadataIdMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result['priceAmountMicros']).toBe('field-1');
      expect(result['priceCurrencyCode']).toBe('field-1');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should handle multiple composite fields', () => {
      const fieldsById = {
        'field-1': createMockFieldMetadata(
          'field-1',
          'fullName',
          FieldMetadataType.FULL_NAME,
        ),
        'field-2': createMockFieldMetadata(
          'field-2',
          'price',
          FieldMetadataType.CURRENCY,
        ),
        'field-3': createMockFieldMetadata(
          'field-3',
          'name',
          FieldMetadataType.TEXT,
        ),
      };

      const objectMetadataItemWithFieldMaps =
        createMockObjectMetadataItemWithFieldMaps(fieldsById);

      const result = getColumnNameToFieldMetadataIdMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result['fullNameFirstName']).toBe('field-1');
      expect(result['fullNameLastName']).toBe('field-1');
      expect(result['priceAmountMicros']).toBe('field-2');
      expect(result['priceCurrencyCode']).toBe('field-2');
      expect(result['name']).toBe('field-3');
      expect(Object.keys(result)).toHaveLength(5);
    });
  });

  describe('with mixed field types', () => {
    it('should handle both simple and composite field types', () => {
      const fieldsById = {
        'field-1': createMockFieldMetadata(
          'field-1',
          'name',
          FieldMetadataType.TEXT,
        ),
        'field-2': createMockFieldMetadata(
          'field-2',
          'fullName',
          FieldMetadataType.FULL_NAME,
        ),
        'field-3': createMockFieldMetadata(
          'field-3',
          'age',
          FieldMetadataType.NUMBER,
        ),
        'field-4': createMockFieldMetadata(
          'field-4',
          'price',
          FieldMetadataType.CURRENCY,
        ),
      };

      const objectMetadataItemWithFieldMaps =
        createMockObjectMetadataItemWithFieldMaps(fieldsById);

      const result = getColumnNameToFieldMetadataIdMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result['name']).toBe('field-1');
      expect(result['fullNameFirstName']).toBe('field-2');
      expect(result['fullNameLastName']).toBe('field-2');
      expect(result['age']).toBe('field-3');
      expect(result['priceAmountMicros']).toBe('field-4');
      expect(result['priceCurrencyCode']).toBe('field-4');
      expect(Object.keys(result)).toHaveLength(6);
    });
  });

  describe('with relation field types', () => {
    it('should handle relation field types with join column name', () => {
      const fieldsById = {
        'field-1': {
          ...createMockFieldMetadata(
            'field-1',
            'company',
            FieldMetadataType.RELATION,
          ),
          settings: {
            relationType: 'ONE_TO_ONE',
            joinColumnName: 'companyId',
          },
        },
        'field-2': createMockFieldMetadata(
          'field-2',
          'name',
          FieldMetadataType.TEXT,
        ),
      };

      const objectMetadataItemWithFieldMaps =
        createMockObjectMetadataItemWithFieldMaps(fieldsById);

      const result = getColumnNameToFieldMetadataIdMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result['companyId']).toBe('field-1');
      expect(result['company']).toBe('field-1');
      expect(result['name']).toBe('field-2');
      expect(Object.keys(result)).toHaveLength(3);
    });

    it('should skip ONE_TO_MANY relation field types', () => {
      const fieldsById = {
        'field-1': {
          ...createMockFieldMetadata(
            'field-1',
            'employees',
            FieldMetadataType.RELATION,
          ),
          settings: {
            relationType: 'ONE_TO_MANY',
            joinColumnName: 'companyId',
          },
        },
        'field-2': createMockFieldMetadata(
          'field-2',
          'name',
          FieldMetadataType.TEXT,
        ),
      };

      const objectMetadataItemWithFieldMaps =
        createMockObjectMetadataItemWithFieldMaps(fieldsById);

      const result = getColumnNameToFieldMetadataIdMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result['name']).toBe('field-2');
      expect(result['companyId']).toBeUndefined();
      expect(Object.keys(result)).toHaveLength(1);
    });
  });
});
