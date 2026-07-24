import {
  AggregateOperations,
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  OrderByDirection,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { getGroupByOrderBy } from 'src/modules/dashboard/chart-data/utils/get-group-by-order-by.util';

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

const emptyMetadataMaps = {
  flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
  flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
};

describe('getGroupByOrderBy', () => {
  const groupByFieldMetadata = createMockFieldMetadata({
    name: 'status',
    type: FieldMetadataType.TEXT,
  });

  const aggregateFieldMetadata = createMockFieldMetadata({
    name: 'amount',
    type: FieldMetadataType.NUMBER,
  });

  describe('FIELD_ASC', () => {
    it('should return field order by ascending', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.FIELD_ASC,
        groupByFieldMetadata,
        ...emptyMetadataMaps,
      });

      expect(result).toEqual([
        {
          status: OrderByDirection.AscNullsLast,
        },
      ]);
    });

    it('should handle date field with granularity', () => {
      const dateFieldMetadata = createMockFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE,
      });

      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.FIELD_ASC,
        groupByFieldMetadata: dateFieldMetadata,
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        ...emptyMetadataMaps,
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
  });

  describe('FIELD_DESC', () => {
    it('should return field order by descending', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.FIELD_DESC,
        groupByFieldMetadata,
        ...emptyMetadataMaps,
      });

      expect(result).toEqual([
        {
          status: OrderByDirection.DescNullsLast,
        },
      ]);
    });
  });

  describe('VALUE_ASC', () => {
    it('should return aggregate order by ascending', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.VALUE_ASC,
        groupByFieldMetadata,
        aggregateOperation: AggregateOperations.SUM,
        aggregateFieldMetadata,
        ...emptyMetadataMaps,
      });

      expect(result).toEqual([
        {
          aggregate: {
            sumAmount: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });

    it('should throw error when aggregate operation is missing', () => {
      expect(() =>
        getGroupByOrderBy({
          graphOrderBy: GraphOrderBy.VALUE_ASC,
          groupByFieldMetadata,
          aggregateFieldMetadata,
          ...emptyMetadataMaps,
        }),
      ).toThrow(
        'Aggregate operation or field metadata not found (field: status)',
      );
    });

    it('should throw error when aggregate field metadata is missing', () => {
      expect(() =>
        getGroupByOrderBy({
          graphOrderBy: GraphOrderBy.VALUE_ASC,
          groupByFieldMetadata,
          aggregateOperation: AggregateOperations.SUM,
          ...emptyMetadataMaps,
        }),
      ).toThrow(
        'Aggregate operation or field metadata not found (field: status)',
      );
    });
  });

  describe('VALUE_DESC', () => {
    it('should return aggregate order by descending', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.VALUE_DESC,
        groupByFieldMetadata,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadata,
        ...emptyMetadataMaps,
      });

      expect(result).toEqual([
        {
          aggregate: {
            totalCount: OrderByDirection.DescNullsLast,
          },
        },
      ]);
    });

    it('should handle different aggregate operations', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.VALUE_DESC,
        groupByFieldMetadata,
        aggregateOperation: AggregateOperations.AVG,
        aggregateFieldMetadata,
        ...emptyMetadataMaps,
      });

      expect(result).toEqual([
        {
          aggregate: {
            avgAmount: OrderByDirection.DescNullsLast,
          },
        },
      ]);
    });
  });

  describe('FIELD_POSITION_ASC', () => {
    it('should return undefined', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.FIELD_POSITION_ASC,
        groupByFieldMetadata,
        ...emptyMetadataMaps,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('FIELD_POSITION_DESC', () => {
    it('should return undefined', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.FIELD_POSITION_DESC,
        groupByFieldMetadata,
        ...emptyMetadataMaps,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('MANUAL', () => {
    it('should return undefined', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.MANUAL,
        groupByFieldMetadata,
        ...emptyMetadataMaps,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('with subFieldName', () => {
    it('should handle composite field with subFieldName', () => {
      const compositeFieldMetadata = createMockFieldMetadata({
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
      });

      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.FIELD_ASC,
        groupByFieldMetadata: compositeFieldMetadata,
        groupBySubFieldName: 'firstName',
        ...emptyMetadataMaps,
      });

      expect(result).toEqual([
        {
          name: {
            firstName: OrderByDirection.AscNullsLast,
          },
        },
      ]);
    });

    it('should handle relation field with subFieldName', () => {
      const relationFieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-id',
      });

      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.FIELD_DESC,
        groupByFieldMetadata: relationFieldMetadata,
        groupBySubFieldName: 'name',
        ...emptyMetadataMaps,
      });

      expect(result).toEqual([
        {
          company: {
            name: OrderByDirection.DescNullsLast,
          },
        },
      ]);
    });
  });

  describe('with bare relation field', () => {
    it('should order by the target label identifier then id', () => {
      const targetNameField = createMockFieldMetadata({
        id: 'target-name-field-id',
        name: 'name',
        type: FieldMetadataType.TEXT,
        universalIdentifier: 'target-name-universal-id',
      });

      const targetObjectMetadata = {
        id: 'target-object-id',
        nameSingular: 'company',
        namePlural: 'companies',
        labelIdentifierFieldMetadataId: targetNameField.id,
        universalIdentifier: 'target-object-universal-id',
      } as FlatObjectMetadata;

      const relationFieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: targetObjectMetadata.id,
      });

      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.FIELD_ASC,
        groupByFieldMetadata: relationFieldMetadata,
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
  });
});
