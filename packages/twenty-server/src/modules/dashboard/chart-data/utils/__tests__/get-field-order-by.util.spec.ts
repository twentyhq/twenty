import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  OrderByDirection,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFieldOrderBy } from 'src/modules/dashboard/chart-data/utils/get-field-order-by.util';

const createMockFieldMetadata = (
  overrides: Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  ({
    id: 'test-id',
    name: 'testField',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'test-universal-id',
    ...overrides,
  }) as FlatFieldMetadata;

const emptyFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
};

const emptyFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
};

describe('getFieldOrderBy', () => {
  describe('composite fields', () => {
    it('should return nested object for FULL_NAME field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: 'firstName',
        dateGranularity: undefined,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          name: {
            firstName: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });

    it('should return nested object for ADDRESS field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'address',
        type: FieldMetadataType.ADDRESS,
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: 'addressCity',
        dateGranularity: undefined,
        direction: OrderByDirection.DescNullsLast,
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          address: {
            addressCity: OrderByDirection.DescNullsLast,
          },
        },
      ]);
    });

    it('should throw error for composite field without subFieldName', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
      });

      expect(() =>
        getFieldOrderBy({
          groupByFieldMetadata: fieldMetadata,
          groupBySubFieldName: null,
          dateGranularity: undefined,
          direction: OrderByDirection.AscNullsLast,
          flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
          flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
        }),
      ).toThrow(
        'Group by subFieldName is required for composite fields (field: name)',
      );
    });
  });

  describe('date fields', () => {
    it('should return date order by with default granularity', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE,
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: null,
        dateGranularity: undefined,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          createdAt: {
            orderBy: OrderByDirection.AscNullsLast,
            granularity: ObjectRecordGroupByDateGranularity.DAY,
          },
        },
      ]);
    });

    it('should return date order by with custom granularity', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE,
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: null,
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          createdAt: {
            orderBy: OrderByDirection.AscNullsLast,
            granularity: ObjectRecordGroupByDateGranularity.MONTH,
          },
        },
      ]);
    });

    it('should handle DATE_TIME field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'updatedAt',
        type: FieldMetadataType.DATE_TIME,
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: null,
        dateGranularity: ObjectRecordGroupByDateGranularity.YEAR,
        direction: OrderByDirection.DescNullsLast,
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          updatedAt: {
            orderBy: OrderByDirection.DescNullsLast,
            granularity: ObjectRecordGroupByDateGranularity.YEAR,
          },
        },
      ]);
    });
  });

  describe('relation fields', () => {
    it('should fall back to id when the target object metadata is missing', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-id',
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: null,
        dateGranularity: undefined,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          company: {
            id: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });

    it('should order by the target label identifier for relation field without subFieldName', () => {
      const targetNameField = createMockFieldMetadata({
        id: 'target-name-field-id',
        name: 'name',
        type: FieldMetadataType.TEXT,
        universalIdentifier: 'target-name-universal-id',
      });

      const targetObjectMetadata = {
        id: 'target-id',
        nameSingular: 'company',
        namePlural: 'companies',
        labelIdentifierFieldMetadataId: targetNameField.id,
        universalIdentifier: 'target-object-universal-id',
      } as FlatObjectMetadata;

      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: targetObjectMetadata.id,
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: null,
        dateGranularity: undefined,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [targetObjectMetadata.universalIdentifier as string]:
              targetObjectMetadata,
          },
          universalIdentifierById: {
            [targetObjectMetadata.id]:
              targetObjectMetadata.universalIdentifier as string,
          },
          universalIdentifiersByApplicationId: {},
        },
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            [targetNameField.universalIdentifier as string]: targetNameField,
          },
          universalIdentifierById: {
            [targetNameField.id]: targetNameField.universalIdentifier as string,
          },
          universalIdentifiersByApplicationId: {},
        },
      });

      expect(result).toEqual([
        {
          company: {
            name: OrderByDirection.AscNullsLast,
          },
        },
        {
          company: {
            id: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });

    it('should return nested object for relation field with subFieldName', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-id',
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: 'name',
        dateGranularity: undefined,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          company: {
            name: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });
  });

  describe('scalar fields', () => {
    it('should return simple order by for TEXT field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'status',
        type: FieldMetadataType.TEXT,
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: null,
        dateGranularity: undefined,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          status: OrderByDirection.AscNullsLast,
        },
      ]);
    });

    it('should return simple order by for SELECT field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'priority',
        type: FieldMetadataType.SELECT,
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: null,
        dateGranularity: undefined,
        direction: OrderByDirection.DescNullsLast,
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          priority: OrderByDirection.DescNullsLast,
        },
      ]);
    });

    it('should return simple order by for NUMBER field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'quantity',
        type: FieldMetadataType.NUMBER,
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: null,
        dateGranularity: undefined,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          quantity: OrderByDirection.AscNullsLast,
        },
      ]);
    });

    it('should return simple order by for BOOLEAN field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'isActive',
        type: FieldMetadataType.BOOLEAN,
      });

      const result = getFieldOrderBy({
        groupByFieldMetadata: fieldMetadata,
        groupBySubFieldName: null,
        dateGranularity: undefined,
        direction: OrderByDirection.AscNullsLast,
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
      });

      expect(result).toEqual([
        {
          isActive: OrderByDirection.AscNullsLast,
        },
      ]);
    });
  });
});
