import {
  AggregateOperations,
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  OrderByDirection,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
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
      });

      expect(result).toEqual({
        status: OrderByDirection.AscNullsLast,
      });
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
      });

      expect(result).toEqual({
        createdAt: {
          orderBy: OrderByDirection.AscNullsLast,
          granularity: ObjectRecordGroupByDateGranularity.MONTH,
        },
      });
    });
  });

  describe('FIELD_DESC', () => {
    it('should return field order by descending', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.FIELD_DESC,
        groupByFieldMetadata,
      });

      expect(result).toEqual({
        status: OrderByDirection.DescNullsLast,
      });
    });
  });

  describe('VALUE_ASC', () => {
    it('should return aggregate order by ascending', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.VALUE_ASC,
        groupByFieldMetadata,
        aggregateOperation: AggregateOperations.SUM,
        aggregateFieldMetadata,
      });

      expect(result).toEqual({
        aggregate: {
          sumAmount: OrderByDirection.AscNullsLast,
        },
      });
    });

    it('should throw error when aggregate operation is missing', () => {
      expect(() =>
        getGroupByOrderBy({
          graphOrderBy: GraphOrderBy.VALUE_ASC,
          groupByFieldMetadata,
          aggregateFieldMetadata,
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
      });

      expect(result).toEqual({
        aggregate: {
          totalCount: OrderByDirection.DescNullsLast,
        },
      });
    });

    it('should handle different aggregate operations', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.VALUE_DESC,
        groupByFieldMetadata,
        aggregateOperation: AggregateOperations.AVG,
        aggregateFieldMetadata,
      });

      expect(result).toEqual({
        aggregate: {
          avgAmount: OrderByDirection.DescNullsLast,
        },
      });
    });
  });

  describe('FIELD_POSITION_ASC', () => {
    it('should return undefined', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.FIELD_POSITION_ASC,
        groupByFieldMetadata,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('FIELD_POSITION_DESC', () => {
    it('should return undefined', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.FIELD_POSITION_DESC,
        groupByFieldMetadata,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('MANUAL', () => {
    it('should return undefined', () => {
      const result = getGroupByOrderBy({
        graphOrderBy: GraphOrderBy.MANUAL,
        groupByFieldMetadata,
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
      });

      expect(result).toEqual({
        name: {
          firstName: OrderByDirection.AscNullsLast,
        },
      });
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
      });

      expect(result).toEqual({
        company: {
          name: OrderByDirection.DescNullsLast,
        },
      });
    });
  });
});
