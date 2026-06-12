import { ViewFilterOperand } from '@/types/ViewFilterOperand';

import { filterOutInvalidRecordFilters } from '../filterOutInvalidRecordFilters';

describe('filterOutInvalidRecordFilters', () => {
  it('should keep filters with valid values', () => {
    const filters = [
      { operand: ViewFilterOperand.IS, value: 'some-value' },
      { operand: ViewFilterOperand.CONTAINS, value: 'search-term' },
    ];

    expect(filterOutInvalidRecordFilters(filters)).toEqual(filters);
  });

  it('should remove filters with empty values for value-requiring operands', () => {
    const filters = [
      { operand: ViewFilterOperand.IS, value: '' },
      { operand: ViewFilterOperand.CONTAINS, value: 'keep-me' },
      { operand: ViewFilterOperand.IS_NOT, value: '[]' },
    ];

    expect(filterOutInvalidRecordFilters(filters)).toEqual([
      { operand: ViewFilterOperand.CONTAINS, value: 'keep-me' },
    ]);
  });

  it('should keep filters with operands that do not require a value', () => {
    const filters = [
      { operand: ViewFilterOperand.IS_EMPTY, value: '' },
      { operand: ViewFilterOperand.IS_NOT_EMPTY, value: '' },
      { operand: ViewFilterOperand.IS_NOT_NULL, value: '' },
      { operand: ViewFilterOperand.IS_IN_PAST, value: '' },
      { operand: ViewFilterOperand.IS_IN_FUTURE, value: '' },
      { operand: ViewFilterOperand.IS_TODAY, value: '' },
    ];

    expect(filterOutInvalidRecordFilters(filters)).toEqual(filters);
  });

  it('should return an empty array when all filters are invalid', () => {
    const filters = [
      { operand: ViewFilterOperand.IS, value: '' },
      {
        operand: ViewFilterOperand.IS_NOT,
        value: undefined as unknown as string,
      },
    ];

    expect(filterOutInvalidRecordFilters(filters)).toEqual([]);
  });

  it('should return an empty array for empty input', () => {
    expect(filterOutInvalidRecordFilters([])).toEqual([]);
  });

  it('should preserve extra properties on the filter objects', () => {
    const filters = [
      {
        id: 'filter-1',
        operand: ViewFilterOperand.IS,
        value: 'valid',
        fieldMetadataId: 'field-1',
      },
    ];

    const result = filterOutInvalidRecordFilters(filters);

    expect(result).toEqual(filters);
    expect(result[0].id).toBe('filter-1');
    expect(result[0].fieldMetadataId).toBe('field-1');
  });
});
