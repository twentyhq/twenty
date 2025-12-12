import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/twenty-orm/utils/get-column-name-to-field-metadata-id.util';

describe('getColumnNameToFieldMetadataIdMap', () => {
  const createMockFlatObjectMetadata = (
    fieldMetadataIds: string[],
  ): FlatObjectMetadata =>
    ({
      id: 'test-object-id',
      nameSingular: 'test',
      namePlural: 'tests',
      labelSingular: 'Test',
      labelPlural: 'Tests',
      icon: 'IconTest',
      targetTableName: 'test',
      isCustom: false,
      isRemote: false,
      isActive: true,
      isSystem: false,
      isAuditLogged: false,
      isSearchable: false,
      workspaceId: 'test-workspace-id',
      universalIdentifier: 'test-object-id',
      indexMetadataIds: [],
      fieldMetadataIds,
      viewIds: [],
      applicationId: null,
      isLabelSyncedWithName: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shortcut: null,
      description: null,
      standardOverrides: null,
      isUIReadOnly: false,
      standardId: null,
      labelIdentifierFieldMetadataId: null,
      imageIdentifierFieldMetadataId: null,
      duplicateCriteria: null,
    }) as FlatObjectMetadata;

  const createMockFlatFieldMetadata = (
    id: string,
    name: string,
    type: FieldMetadataType,
    settings?: Record<string, unknown>,
  ): FlatFieldMetadata =>
    ({
      id,
      name,
      type,
      label: name,
      objectMetadataId: 'test-object-id',
      isLabelSyncedWithName: true,
      isNullable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: id,
      viewFieldIds: [],
      viewFilterIds: [],
      viewGroupIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
      ...(settings ? { settings } : {}),
    }) as unknown as FlatFieldMetadata;

  const buildFlatFieldMetadataMaps = (
    fields: FlatFieldMetadata[],
  ): FlatEntityMaps<FlatFieldMetadata> => ({
    byId: fields.reduce(
      (acc, field) => {
        acc[field.id] = field;

        return acc;
      },
      {} as Record<string, FlatFieldMetadata>,
    ),
    idByUniversalIdentifier: fields.reduce(
      (acc, field) => {
        acc[field.universalIdentifier] = field.id;

        return acc;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  });

  describe('with simple field types', () => {
    it('should return a map with column name to field metadata id for simple field types', () => {
      const fields = [
        createMockFlatFieldMetadata('field-1', 'name', FieldMetadataType.TEXT),
        createMockFlatFieldMetadata('field-2', 'age', FieldMetadataType.NUMBER),
      ];
      const flatObjectMetadata = createMockFlatObjectMetadata(
        fields.map((f) => f.id),
      );
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

      const result = getColumnNameToFieldMetadataIdMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );

      expect(result['name']).toBe('field-1');
      expect(result['age']).toBe('field-2');
      expect(Object.keys(result)).toHaveLength(2);
    });
  });

  describe('with composite field types', () => {
    it('should return column names to field metadata id for FULL_NAME composite type', () => {
      const fields = [
        createMockFlatFieldMetadata(
          'field-1',
          'fullName',
          FieldMetadataType.FULL_NAME,
        ),
      ];
      const flatObjectMetadata = createMockFlatObjectMetadata(
        fields.map((f) => f.id),
      );
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

      const result = getColumnNameToFieldMetadataIdMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );

      expect(result['fullNameFirstName']).toBe('field-1');
      expect(result['fullNameLastName']).toBe('field-1');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should return column names to field metadata id for CURRENCY composite type', () => {
      const fields = [
        createMockFlatFieldMetadata(
          'field-1',
          'price',
          FieldMetadataType.CURRENCY,
        ),
      ];
      const flatObjectMetadata = createMockFlatObjectMetadata(
        fields.map((f) => f.id),
      );
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

      const result = getColumnNameToFieldMetadataIdMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );

      expect(result['priceAmountMicros']).toBe('field-1');
      expect(result['priceCurrencyCode']).toBe('field-1');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should handle multiple composite fields', () => {
      const fields = [
        createMockFlatFieldMetadata(
          'field-1',
          'fullName',
          FieldMetadataType.FULL_NAME,
        ),
        createMockFlatFieldMetadata(
          'field-2',
          'price',
          FieldMetadataType.CURRENCY,
        ),
        createMockFlatFieldMetadata('field-3', 'name', FieldMetadataType.TEXT),
      ];
      const flatObjectMetadata = createMockFlatObjectMetadata(
        fields.map((f) => f.id),
      );
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

      const result = getColumnNameToFieldMetadataIdMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
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
      const fields = [
        createMockFlatFieldMetadata('field-1', 'name', FieldMetadataType.TEXT),
        createMockFlatFieldMetadata(
          'field-2',
          'fullName',
          FieldMetadataType.FULL_NAME,
        ),
        createMockFlatFieldMetadata('field-3', 'age', FieldMetadataType.NUMBER),
        createMockFlatFieldMetadata(
          'field-4',
          'price',
          FieldMetadataType.CURRENCY,
        ),
      ];
      const flatObjectMetadata = createMockFlatObjectMetadata(
        fields.map((f) => f.id),
      );
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

      const result = getColumnNameToFieldMetadataIdMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
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
      const fields = [
        createMockFlatFieldMetadata(
          'field-1',
          'company',
          FieldMetadataType.RELATION,
          {
            relationType: 'ONE_TO_ONE',
            joinColumnName: 'companyId',
          },
        ),
        createMockFlatFieldMetadata('field-2', 'name', FieldMetadataType.TEXT),
      ];
      const flatObjectMetadata = createMockFlatObjectMetadata(
        fields.map((f) => f.id),
      );
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

      const result = getColumnNameToFieldMetadataIdMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );

      expect(result['companyId']).toBe('field-1');
      expect(result['company']).toBe('field-1');
      expect(result['name']).toBe('field-2');
      expect(Object.keys(result)).toHaveLength(3);
    });

    it('should skip ONE_TO_MANY relation field types', () => {
      const fields = [
        createMockFlatFieldMetadata(
          'field-1',
          'employees',
          FieldMetadataType.RELATION,
          {
            relationType: 'ONE_TO_MANY',
            joinColumnName: 'companyId',
          },
        ),
        createMockFlatFieldMetadata('field-2', 'name', FieldMetadataType.TEXT),
      ];
      const flatObjectMetadata = createMockFlatObjectMetadata(
        fields.map((f) => f.id),
      );
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

      const result = getColumnNameToFieldMetadataIdMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );

      expect(result['name']).toBe('field-2');
      expect(result['companyId']).toBeUndefined();
      expect(Object.keys(result)).toHaveLength(1);
    });
  });
});
