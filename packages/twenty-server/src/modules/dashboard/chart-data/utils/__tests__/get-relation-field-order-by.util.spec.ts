import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  OrderByDirection,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getRelationFieldOrderBy } from 'src/modules/dashboard/chart-data/utils/get-relation-field-order-by.util';

const createMockFieldMetadata = (
  overrides: Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  ({
    id: 'test-id',
    name: 'testField',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'test-universal-id',
    ...overrides,
  }) as FlatFieldMetadata;

describe('getRelationFieldOrderBy', () => {
  const relationFieldMetadata = createMockFieldMetadata({
    name: 'company',
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: 'target-id',
  });

  describe('without subFieldName', () => {
    it('should return Id suffix for relation field', () => {
      const result = getRelationFieldOrderBy(
        relationFieldMetadata,
        null,
        OrderByDirection.AscNullsLast,
      );

      expect(result).toEqual({
        companyId: OrderByDirection.AscNullsLast,
      });
    });

    it('should return Id suffix for undefined subFieldName', () => {
      const result = getRelationFieldOrderBy(
        relationFieldMetadata,
        undefined,
        OrderByDirection.DescNullsLast,
      );

      expect(result).toEqual({
        companyId: OrderByDirection.DescNullsLast,
      });
    });
  });

  describe('with simple subFieldName', () => {
    it('should return nested object for simple subfield', () => {
      const result = getRelationFieldOrderBy(
        relationFieldMetadata,
        'name',
        OrderByDirection.AscNullsLast,
      );

      expect(result).toEqual({
        company: {
          name: OrderByDirection.AscNullsLast,
        },
      });
    });

    it('should handle descending direction', () => {
      const result = getRelationFieldOrderBy(
        relationFieldMetadata,
        'name',
        OrderByDirection.DescNullsLast,
      );

      expect(result).toEqual({
        company: {
          name: OrderByDirection.DescNullsLast,
        },
      });
    });
  });

  describe('with composite subFieldName', () => {
    it('should return deeply nested object for composite subfield', () => {
      const result = getRelationFieldOrderBy(
        relationFieldMetadata,
        'address.addressCity',
        OrderByDirection.AscNullsLast,
      );

      expect(result).toEqual({
        company: {
          address: {
            addressCity: OrderByDirection.AscNullsLast,
          },
        },
      });
    });
  });

  describe('with date granularity', () => {
    it('should return date order by with granularity', () => {
      const result = getRelationFieldOrderBy(
        relationFieldMetadata,
        'createdAt',
        OrderByDirection.AscNullsLast,
        ObjectRecordGroupByDateGranularity.MONTH,
        true,
      );

      expect(result).toEqual({
        company: {
          createdAt: {
            orderBy: OrderByDirection.AscNullsLast,
            granularity: ObjectRecordGroupByDateGranularity.MONTH,
          },
        },
      });
    });

    it('should use default granularity when isNestedDateField is true but granularity not provided', () => {
      const result = getRelationFieldOrderBy(
        relationFieldMetadata,
        'createdAt',
        OrderByDirection.AscNullsLast,
        undefined,
        true,
      );

      expect(result).toEqual({
        company: {
          createdAt: {
            orderBy: OrderByDirection.AscNullsLast,
            granularity: ObjectRecordGroupByDateGranularity.DAY,
          },
        },
      });
    });

    it('should return date order by when dateGranularity is provided', () => {
      const result = getRelationFieldOrderBy(
        relationFieldMetadata,
        'createdAt',
        OrderByDirection.DescNullsLast,
        ObjectRecordGroupByDateGranularity.YEAR,
      );

      expect(result).toEqual({
        company: {
          createdAt: {
            orderBy: OrderByDirection.DescNullsLast,
            granularity: ObjectRecordGroupByDateGranularity.YEAR,
          },
        },
      });
    });
  });
});
