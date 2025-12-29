import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFieldMetadataIdToColumnNamesMap } from 'src/engine/twenty-orm/utils/get-field-metadata-id-to-column-names-map.util';

describe('getFieldMetadataIdToColumnNamesMap', () => {
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
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      mainGroupByFieldMetadataViewIds: [],
      applicationId: null,
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
    it('should return a map with single column name for simple field types', () => {
      const fields = [
        createMockFlatFieldMetadata('field-1', 'name', FieldMetadataType.TEXT),
        createMockFlatFieldMetadata('field-2', 'age', FieldMetadataType.NUMBER),
      ];
      const flatObjectMetadata = createMockFlatObjectMetadata(
        fields.map((f) => f.id),
      );
      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps(fields);

      const result = getFieldMetadataIdToColumnNamesMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );

      expect(result.get('field-1')).toEqual(['name']);
      expect(result.get('field-2')).toEqual(['age']);
      expect(result.size).toBe(2);
    });
  });

  describe('with composite field types', () => {
    it('should return multiple column names for FULL_NAME composite type', () => {
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

      const result = getFieldMetadataIdToColumnNamesMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );

      expect(result.get('field-1')).toEqual([
        'fullNameFirstName',
        'fullNameLastName',
      ]);
      expect(result.size).toBe(1);
    });

    it('should return multiple column names for CURRENCY composite type', () => {
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

      const result = getFieldMetadataIdToColumnNamesMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      );

      expect(result.get('field-1')).toEqual([
        'priceAmountMicros',
        'priceCurrencyCode',
      ]);
      expect(result.size).toBe(1);
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

      const result = getFieldMetadataIdToColumnNamesMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
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

      const result = getFieldMetadataIdToColumnNamesMap(
        flatObjectMetadata,
        flatFieldMetadataMaps,
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
