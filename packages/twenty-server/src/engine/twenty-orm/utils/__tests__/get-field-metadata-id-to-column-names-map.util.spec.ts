import { FieldMetadataType } from 'twenty-shared/types';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getFieldMetadataIdToColumnNamesMap } from 'src/engine/twenty-orm/utils/get-field-metadata-id-to-column-names-map.util';

describe('getFieldMetadataIdToColumnNamesMap', () => {
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
    it('should return a map with single column name for simple field types', () => {
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

      const result = getFieldMetadataIdToColumnNamesMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result.get('field-1')).toEqual(['name']);
      expect(result.get('field-2')).toEqual(['age']);
      expect(result.size).toBe(2);
    });
  });

  describe('with composite field types', () => {
    it('should return multiple column names for FULL_NAME composite type', () => {
      const fieldsById = {
        'field-1': createMockFieldMetadata(
          'field-1',
          'fullName',
          FieldMetadataType.FULL_NAME,
        ),
      };

      const objectMetadataItemWithFieldMaps =
        createMockObjectMetadataItemWithFieldMaps(fieldsById);

      const result = getFieldMetadataIdToColumnNamesMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result.get('field-1')).toEqual([
        'fullNameFirstName',
        'fullNameLastName',
      ]);
      expect(result.size).toBe(1);
    });

    it('should return multiple column names for CURRENCY composite type', () => {
      const fieldsById = {
        'field-1': createMockFieldMetadata(
          'field-1',
          'price',
          FieldMetadataType.CURRENCY,
        ),
      };

      const objectMetadataItemWithFieldMaps =
        createMockObjectMetadataItemWithFieldMaps(fieldsById);

      const result = getFieldMetadataIdToColumnNamesMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result.get('field-1')).toEqual([
        'priceAmountMicros',
        'priceCurrencyCode',
      ]);
      expect(result.size).toBe(1);
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

      const result = getFieldMetadataIdToColumnNamesMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result.get('field-1')).toEqual([
        'fullNameFirstName',
        'fullNameLastName',
      ]);
      expect(result.get('field-2')).toEqual([
        'priceAmountMicros',
        'priceCurrencyCode',
      ]);
      expect(result.get('field-3')).toEqual(['name']);
      expect(result.size).toBe(3);
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

      const result = getFieldMetadataIdToColumnNamesMap(
        objectMetadataItemWithFieldMaps,
      );

      expect(result.get('field-1')).toEqual(['name']);
      expect(result.get('field-2')).toEqual([
        'fullNameFirstName',
        'fullNameLastName',
      ]);
      expect(result.get('field-3')).toEqual(['age']);
      expect(result.get('field-4')).toEqual([
        'priceAmountMicros',
        'priceCurrencyCode',
      ]);
      expect(result.size).toBe(4);
    });
  });
});
