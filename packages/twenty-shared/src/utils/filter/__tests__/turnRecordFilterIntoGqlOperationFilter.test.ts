import {
  FieldMetadataType,
  ViewFilterOperand as RecordFilterOperand,
} from '@/types';
import { turnRecordFilterIntoRecordGqlOperationFilter } from '@/utils/filter/turnRecordFilterIntoGqlOperationFilter';
import { type RecordFilter } from '@/utils';

const fields = [
  { id: 'f-text', name: 'name', type: FieldMetadataType.TEXT, label: 'Name' },
  {
    id: 'f-number',
    name: 'amount',
    type: FieldMetadataType.NUMBER,
    label: 'Amount',
  },
  {
    id: 'f-date',
    name: 'createdAt',
    type: FieldMetadataType.DATE,
    label: 'Created At',
  },
  {
    id: 'f-datetime',
    name: 'updatedAt',
    type: FieldMetadataType.DATE_TIME,
    label: 'Updated At',
  },
  {
    id: 'f-select',
    name: 'status',
    type: FieldMetadataType.SELECT,
    label: 'Status',
  },
  {
    id: 'f-multiselect',
    name: 'tags',
    type: FieldMetadataType.MULTI_SELECT,
    label: 'Tags',
  },
  {
    id: 'f-rating',
    name: 'rating',
    type: FieldMetadataType.RATING,
    label: 'Rating',
  },
  {
    id: 'f-relation',
    name: 'company',
    type: FieldMetadataType.RELATION,
    label: 'Company',
  },
  {
    id: 'f-bool',
    name: 'isActive',
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Active',
  },
  {
    id: 'f-rawjson',
    name: 'metadata',
    type: FieldMetadataType.RAW_JSON,
    label: 'Metadata',
  },
  {
    id: 'f-files',
    name: 'attachments',
    type: FieldMetadataType.FILES,
    label: 'Attachments',
  },
  {
    id: 'f-tsvector',
    name: 'search',
    type: FieldMetadataType.TS_VECTOR,
    label: 'Search',
  },
  {
    id: 'f-currency',
    name: 'revenue',
    type: FieldMetadataType.CURRENCY,
    label: 'Revenue',
  },
  {
    id: 'f-fullname',
    name: 'fullName',
    type: FieldMetadataType.FULL_NAME,
    label: 'Full Name',
  },
  {
    id: 'f-address',
    name: 'location',
    type: FieldMetadataType.ADDRESS,
    label: 'Location',
  },
  {
    id: 'f-actor',
    name: 'actor',
    type: FieldMetadataType.ACTOR,
    label: 'Actor',
  },
  {
    id: 'f-phones',
    name: 'phone',
    type: FieldMetadataType.PHONES,
    label: 'Phone',
  },
  {
    id: 'f-emails',
    name: 'email',
    type: FieldMetadataType.EMAILS,
    label: 'Email',
  },
  {
    id: 'f-links',
    name: 'website',
    type: FieldMetadataType.LINKS,
    label: 'Website',
  },
  {
    id: 'f-array',
    name: 'items',
    type: FieldMetadataType.ARRAY,
    label: 'Items',
  },
  {
    id: 'f-uuid',
    name: 'recordId',
    type: FieldMetadataType.UUID,
    label: 'Record ID',
  },
];

const filterValueDependencies = { timeZone: 'UTC' };

const makeFilter = (
  fieldMetadataId: string,
  operand: RecordFilterOperand,
  value: string,
  type: string = 'TEXT',
  subFieldName?: string,
) =>
  ({
    id: 'test-filter',
    fieldMetadataId,
    value,
    type: type as any,
    operand,
    subFieldName,
  }) as RecordFilter;

describe('turnRecordFilterIntoRecordGqlOperationFilter', () => {
  it('should return undefined when field metadata is not found', () => {
    const result = turnRecordFilterIntoRecordGqlOperationFilter({
      filterValueDependencies,
      recordFilter: makeFilter(
        'nonexistent',
        RecordFilterOperand.CONTAINS,
        'x',
      ),
      fieldMetadataItems: fields,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when value is empty for non-emptiness operand', () => {
    const result = turnRecordFilterIntoRecordGqlOperationFilter({
      filterValueDependencies,
      recordFilter: makeFilter('f-text', RecordFilterOperand.CONTAINS, ''),
      fieldMetadataItems: fields,
    });

    expect(result).toBeUndefined();
  });

  describe('TEXT filter', () => {
    it('should handle CONTAINS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-text',
          RecordFilterOperand.CONTAINS,
          'test',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ name: { ilike: '%test%' } });
    });

    it('should handle DOES_NOT_CONTAIN operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-text',
          RecordFilterOperand.DOES_NOT_CONTAIN,
          'test',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ not: { name: { ilike: '%test%' } } });
    });
  });

  describe('NUMBER filter', () => {
    it('should handle IS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter('f-number', RecordFilterOperand.IS, '42'),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ amount: { eq: 42 } });
    });

    it('should handle IS_NOT operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter('f-number', RecordFilterOperand.IS_NOT, '42'),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ not: { amount: { eq: 42 } } });
    });

    it('should handle GREATER_THAN_OR_EQUAL operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-number',
          RecordFilterOperand.GREATER_THAN_OR_EQUAL,
          '10',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ amount: { gte: 10 } });
    });

    it('should handle LESS_THAN_OR_EQUAL operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-number',
          RecordFilterOperand.LESS_THAN_OR_EQUAL,
          '100',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ amount: { lte: 100 } });
    });
  });

  describe('DATE filter', () => {
    it('should handle IS_AFTER operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-date',
          RecordFilterOperand.IS_AFTER,
          '2024-03-15',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ createdAt: { gte: '2024-03-15' } });
    });

    it('should handle IS_BEFORE operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-date',
          RecordFilterOperand.IS_BEFORE,
          '2024-03-15',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ createdAt: { lt: '2024-03-15' } });
    });

    it('should handle IS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-date',
          RecordFilterOperand.IS,
          '2024-03-15',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ createdAt: { eq: '2024-03-15' } });
    });

    it('should handle IS_IN_PAST operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter('f-date', RecordFilterOperand.IS_IN_PAST, ''),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('createdAt.lt');
    });

    it('should handle IS_IN_FUTURE operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-date',
          RecordFilterOperand.IS_IN_FUTURE,
          '',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('createdAt.gte');
    });

    it('should handle IS_TODAY operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter('f-date', RecordFilterOperand.IS_TODAY, ''),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('createdAt.eq');
    });

    it('should handle IS_RELATIVE operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-date',
          RecordFilterOperand.IS_RELATIVE,
          'PAST_7_DAY',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('and');
    });
  });

  describe('DATE_TIME filter', () => {
    it('should handle IS_AFTER operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-datetime',
          RecordFilterOperand.IS_AFTER,
          '2024-03-15T10:00:00Z',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('updatedAt.gte');
    });

    it('should handle IS_BEFORE operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-datetime',
          RecordFilterOperand.IS_BEFORE,
          '2024-03-15T10:00:00Z',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('updatedAt.lt');
    });

    it('should handle IS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-datetime',
          RecordFilterOperand.IS,
          '2024-03-15T10:00:00Z',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('and');
    });

    it('should handle IS_IN_PAST operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-datetime',
          RecordFilterOperand.IS_IN_PAST,
          '',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('updatedAt.lt');
    });

    it('should handle IS_IN_FUTURE operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-datetime',
          RecordFilterOperand.IS_IN_FUTURE,
          '',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('updatedAt.gt');
    });

    it('should handle IS_TODAY operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-datetime',
          RecordFilterOperand.IS_TODAY,
          '',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('and');
    });

    it('should handle IS_RELATIVE operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-datetime',
          RecordFilterOperand.IS_RELATIVE,
          `PAST_7_DAY;;UTC;;`,
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('and');
    });
  });

  describe('RATING filter', () => {
    it('should handle IS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter('f-rating', RecordFilterOperand.IS, '3'),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('rating.eq');
    });

    it('should handle GREATER_THAN_OR_EQUAL operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-rating',
          RecordFilterOperand.GREATER_THAN_OR_EQUAL,
          '3',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('rating.in');
    });

    it('should handle LESS_THAN_OR_EQUAL operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-rating',
          RecordFilterOperand.LESS_THAN_OR_EQUAL,
          '3',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('rating.in');
    });
  });

  describe('BOOLEAN filter', () => {
    it('should handle IS operand with true', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter('f-bool', RecordFilterOperand.IS, 'true'),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ isActive: { eq: true } });
    });

    it('should handle IS operand with false', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter('f-bool', RecordFilterOperand.IS, 'false'),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ isActive: { eq: false } });
    });
  });

  describe('SELECT filter', () => {
    it('should handle IS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-select',
          RecordFilterOperand.IS,
          '["ACTIVE","PENDING"]',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('status.in');
    });

    it('should handle IS_NOT operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-select',
          RecordFilterOperand.IS_NOT,
          '["ACTIVE"]',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('not');
    });
  });

  describe('MULTI_SELECT filter', () => {
    it('should handle CONTAINS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-multiselect',
          RecordFilterOperand.CONTAINS,
          '["TAG1","TAG2"]',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('tags.containsAny');
    });

    it('should handle DOES_NOT_CONTAIN operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-multiselect',
          RecordFilterOperand.DOES_NOT_CONTAIN,
          '["TAG1"]',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('or');
    });
  });

  describe('RELATION filter', () => {
    it('should handle IS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-relation',
          RecordFilterOperand.IS,
          '["550e8400-e29b-41d4-a716-446655440000"]',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('companyId.in');
    });

    it('should handle IS_NOT operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-relation',
          RecordFilterOperand.IS_NOT,
          '["550e8400-e29b-41d4-a716-446655440000"]',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('or');
    });
  });

  describe('RAW_JSON filter', () => {
    it('should handle CONTAINS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-rawjson',
          RecordFilterOperand.CONTAINS,
          'test',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ metadata: { like: '%test%' } });
    });

    it('should handle DOES_NOT_CONTAIN operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-rawjson',
          RecordFilterOperand.DOES_NOT_CONTAIN,
          'test',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ not: { metadata: { like: '%test%' } } });
    });
  });

  describe('FILES filter', () => {
    it('should handle CONTAINS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-files',
          RecordFilterOperand.CONTAINS,
          'doc',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ attachments: { like: '%doc%' } });
    });
  });

  describe('TS_VECTOR filter', () => {
    it('should handle VECTOR_SEARCH operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-tsvector',
          RecordFilterOperand.VECTOR_SEARCH,
          'hello world',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toEqual({ search: { search: 'hello world' } });
    });
  });

  describe('CURRENCY filter', () => {
    it('should handle GREATER_THAN_OR_EQUAL on amountMicros', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-currency',
          RecordFilterOperand.GREATER_THAN_OR_EQUAL,
          '1000',
          'CURRENCY',
          'amountMicros',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('revenue');
    });
  });

  describe('FULL_NAME filter', () => {
    it('should handle CONTAINS operand without subfield', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-fullname',
          RecordFilterOperand.CONTAINS,
          'John',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('or');
    });
  });

  describe('ADDRESS filter', () => {
    it('should handle CONTAINS operand without subfield', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-address',
          RecordFilterOperand.CONTAINS,
          'Paris',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('or');
    });
  });

  describe('ACTOR filter', () => {
    it('should handle CONTAINS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-actor',
          RecordFilterOperand.CONTAINS,
          'Admin',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toBeDefined();
    });
  });

  describe('PHONES filter', () => {
    it('should handle CONTAINS on primaryPhoneNumber', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-phones',
          RecordFilterOperand.CONTAINS,
          '555',
          'PHONES',
          'primaryPhoneNumber',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toBeDefined();
    });
  });

  describe('EMAILS filter', () => {
    it('should handle CONTAINS on primaryEmail', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-emails',
          RecordFilterOperand.CONTAINS,
          'test@example.com',
          'EMAILS',
          'primaryEmail',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toBeDefined();
    });
  });

  describe('LINKS filter', () => {
    it('should handle CONTAINS on primaryLinkUrl', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-links',
          RecordFilterOperand.CONTAINS,
          'example.com',
          'LINKS',
          'primaryLinkUrl',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toBeDefined();
    });
  });

  describe('ARRAY filter', () => {
    it('should handle CONTAINS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-array',
          RecordFilterOperand.CONTAINS,
          '["item1"]',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toBeDefined();
    });

    it('should handle DOES_NOT_CONTAIN operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-array',
          RecordFilterOperand.DOES_NOT_CONTAIN,
          '["item1"]',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('not');
    });
  });

  describe('UUID filter', () => {
    it('should handle IS operand', () => {
      const result = turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: makeFilter(
          'f-uuid',
          RecordFilterOperand.IS,
          '["550e8400-e29b-41d4-a716-446655440000"]',
        ),
        fieldMetadataItems: fields,
      });

      expect(result).toHaveProperty('recordId.in');
    });
  });
});
