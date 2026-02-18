import { FieldMetadataType, ViewFilterOperand } from '@/types';
import { getEmptyRecordGqlOperationFilter } from '@/utils/filter/utils/getEmptyRecordGqlOperationFilter';
import { type RecordFilter } from '@/utils';

const makeParams = (
  fieldType: FieldMetadataType,
  operand: ViewFilterOperand = ViewFilterOperand.IS_EMPTY,
  subFieldName?: string,
) => ({
  operand,
  correspondingField: { id: 'f1', name: 'testField', type: fieldType },
  recordFilter: {
    id: '1',
    fieldMetadataId: 'f1',
    value: '',
    type: 'TEXT' as any,
    operand,
    subFieldName,
  } as RecordFilter,
});

describe('getEmptyRecordGqlOperationFilter', () => {
  describe('IS_EMPTY operand', () => {
    it('should handle TEXT type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.TEXT),
      );

      expect(result).toHaveProperty('or');
    });

    it('should handle NUMBER type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.NUMBER),
      );

      expect(result).toEqual({
        testField: { is: 'NULL' },
      });
    });

    it('should handle DATE type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.DATE),
      );

      expect(result).toEqual({
        testField: { is: 'NULL' },
      });
    });

    it('should handle DATE_TIME type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.DATE_TIME),
      );

      expect(result).toEqual({
        testField: { is: 'NULL' },
      });
    });

    it('should handle SELECT type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.SELECT),
      );

      expect(result).toEqual({
        testField: { is: 'NULL' },
      });
    });

    it('should handle MULTI_SELECT type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.MULTI_SELECT),
      );

      expect(result).toHaveProperty('or');
    });

    it('should handle RATING type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.RATING),
      );

      expect(result).toEqual({
        testField: { is: 'NULL' },
      });
    });

    it('should handle RELATION type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.RELATION),
      );

      expect(result).toEqual({
        testFieldId: { is: 'NULL' },
      });
    });

    it('should handle CURRENCY type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.CURRENCY),
      );

      expect(result).toHaveProperty('or');
    });

    it('should handle ACTOR type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.ACTOR),
      );

      expect(result).toHaveProperty('or');
    });

    it('should handle ARRAY type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.ARRAY),
      );

      expect(result).toHaveProperty('or');
    });

    it('should handle RAW_JSON type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.RAW_JSON),
      );

      expect(result).toHaveProperty('or');
    });

    it('should handle FILES type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.FILES),
      );

      expect(result).toHaveProperty('or');
    });

    it('should handle FULL_NAME type without subfield', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.FULL_NAME),
      );

      expect(result).toHaveProperty('and');
    });

    it('should handle FULL_NAME type with subfield', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(
          FieldMetadataType.FULL_NAME,
          ViewFilterOperand.IS_EMPTY,
          'firstName',
        ),
      );

      expect(result).toHaveProperty('or');
    });

    it('should handle PHONES type without subfield', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.PHONES),
      );

      expect(result).toHaveProperty('and');
    });

    it('should handle PHONES type with primaryPhoneNumber subfield', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(
          FieldMetadataType.PHONES,
          ViewFilterOperand.IS_EMPTY,
          'primaryPhoneNumber',
        ),
      );

      expect(result).toHaveProperty('or');
    });

    it('should handle PHONES type with additionalPhones subfield', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(
          FieldMetadataType.PHONES,
          ViewFilterOperand.IS_EMPTY,
          'additionalPhones',
        ),
      );

      expect(result).toHaveProperty('or');
    });

    it('should handle ADDRESS type without subfield', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.ADDRESS),
      );

      expect(result).toHaveProperty('and');
      expect((result as any).and).toHaveLength(6);
    });

    it('should handle ADDRESS type with subfield', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(
          FieldMetadataType.ADDRESS,
          ViewFilterOperand.IS_EMPTY,
          'addressCity',
        ),
      );

      expect(result).toHaveProperty('or');
    });

    it('should handle LINKS type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.LINKS),
      );

      expect(result).toHaveProperty('and');
    });

    it('should handle EMAILS type', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.EMAILS),
      );

      expect(result).toHaveProperty('and');
    });
  });

  describe('IS_NOT_EMPTY operand', () => {
    it('should wrap filter in not for IS_NOT_EMPTY', () => {
      const result = getEmptyRecordGqlOperationFilter(
        makeParams(FieldMetadataType.TEXT, ViewFilterOperand.IS_NOT_EMPTY),
      );

      expect(result).toHaveProperty('not');
    });
  });
});
