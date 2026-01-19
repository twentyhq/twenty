import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  OrderByDirection,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
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

describe('getFieldOrderBy', () => {
  describe('composite fields', () => {
    it('should return nested object for FULL_NAME field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
      });

      const result = getFieldOrderBy(
        fieldMetadata,
        'firstName',
        undefined,
        OrderByDirection.AscNullsLast,
      );

      expect(result).toEqual({
        name: {
          firstName: OrderByDirection.AscNullsLast,
        },
      });
    });

    it('should return nested object for ADDRESS field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'address',
        type: FieldMetadataType.ADDRESS,
      });

      const result = getFieldOrderBy(
        fieldMetadata,
        'addressCity',
        undefined,
        OrderByDirection.DescNullsLast,
      );

      expect(result).toEqual({
        address: {
          addressCity: OrderByDirection.DescNullsLast,
        },
      });
    });

    it('should throw error for composite field without subFieldName', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
      });

      expect(() =>
        getFieldOrderBy(
          fieldMetadata,
          null,
          undefined,
          OrderByDirection.AscNullsLast,
        ),
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

      const result = getFieldOrderBy(
        fieldMetadata,
        null,
        undefined,
        OrderByDirection.AscNullsLast,
      );

      expect(result).toEqual({
        createdAt: {
          orderBy: OrderByDirection.AscNullsLast,
          granularity: ObjectRecordGroupByDateGranularity.DAY,
        },
      });
    });

    it('should return date order by with custom granularity', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE,
      });

      const result = getFieldOrderBy(
        fieldMetadata,
        null,
        ObjectRecordGroupByDateGranularity.MONTH,
        OrderByDirection.AscNullsLast,
      );

      expect(result).toEqual({
        createdAt: {
          orderBy: OrderByDirection.AscNullsLast,
          granularity: ObjectRecordGroupByDateGranularity.MONTH,
        },
      });
    });

    it('should handle DATE_TIME field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'updatedAt',
        type: FieldMetadataType.DATE_TIME,
      });

      const result = getFieldOrderBy(
        fieldMetadata,
        null,
        ObjectRecordGroupByDateGranularity.YEAR,
        OrderByDirection.DescNullsLast,
      );

      expect(result).toEqual({
        updatedAt: {
          orderBy: OrderByDirection.DescNullsLast,
          granularity: ObjectRecordGroupByDateGranularity.YEAR,
        },
      });
    });
  });

  describe('relation fields', () => {
    it('should return Id suffix for relation field without subFieldName', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-id',
      });

      const result = getFieldOrderBy(
        fieldMetadata,
        null,
        undefined,
        OrderByDirection.AscNullsLast,
      );

      expect(result).toEqual({
        companyId: OrderByDirection.AscNullsLast,
      });
    });

    it('should return nested object for relation field with subFieldName', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: 'target-id',
      });

      const result = getFieldOrderBy(
        fieldMetadata,
        'name',
        undefined,
        OrderByDirection.AscNullsLast,
      );

      expect(result).toEqual({
        company: {
          name: OrderByDirection.AscNullsLast,
        },
      });
    });
  });

  describe('scalar fields', () => {
    it('should return simple order by for TEXT field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'status',
        type: FieldMetadataType.TEXT,
      });

      const result = getFieldOrderBy(
        fieldMetadata,
        null,
        undefined,
        OrderByDirection.AscNullsLast,
      );

      expect(result).toEqual({
        status: OrderByDirection.AscNullsLast,
      });
    });

    it('should return simple order by for SELECT field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'priority',
        type: FieldMetadataType.SELECT,
      });

      const result = getFieldOrderBy(
        fieldMetadata,
        null,
        undefined,
        OrderByDirection.DescNullsLast,
      );

      expect(result).toEqual({
        priority: OrderByDirection.DescNullsLast,
      });
    });

    it('should return simple order by for NUMBER field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'quantity',
        type: FieldMetadataType.NUMBER,
      });

      const result = getFieldOrderBy(
        fieldMetadata,
        null,
        undefined,
        OrderByDirection.AscNullsLast,
      );

      expect(result).toEqual({
        quantity: OrderByDirection.AscNullsLast,
      });
    });

    it('should return simple order by for BOOLEAN field', () => {
      const fieldMetadata = createMockFieldMetadata({
        name: 'isActive',
        type: FieldMetadataType.BOOLEAN,
      });

      const result = getFieldOrderBy(
        fieldMetadata,
        null,
        undefined,
        OrderByDirection.AscNullsLast,
      );

      expect(result).toEqual({
        isActive: OrderByDirection.AscNullsLast,
      });
    });
  });
});
