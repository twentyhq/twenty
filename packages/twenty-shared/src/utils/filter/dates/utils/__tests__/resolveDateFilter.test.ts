import { ViewFilterOperand } from '@/types';
import { resolveDateFilter } from '@/utils/filter/dates/utils/resolveDateFilter';
import { resolveDateTimeFilter } from '@/utils/filter/dates/utils/resolveDateTimeFilter';

describe('resolveDateFilter', () => {
  it('should return null for empty value', () => {
    expect(
      resolveDateFilter({ value: '', operand: ViewFilterOperand.IS_AFTER }),
    ).toBeNull();
  });

  it('should return the value directly for non-relative operands', () => {
    expect(
      resolveDateFilter({
        value: '2024-03-15',
        operand: ViewFilterOperand.IS_AFTER,
      }),
    ).toBe('2024-03-15');
  });

  it('should resolve relative date filter for IS_RELATIVE operand', () => {
    const result = resolveDateFilter({
      value: 'PAST_7_DAY',
      operand: ViewFilterOperand.IS_RELATIVE,
    });

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('start');
    expect(result).toHaveProperty('end');
  });
});

describe('resolveDateTimeFilter', () => {
  it('should return null for empty value', () => {
    expect(
      resolveDateTimeFilter({
        value: '',
        operand: ViewFilterOperand.IS_AFTER,
      }),
    ).toBeNull();
  });

  it('should return the value directly for non-relative operands', () => {
    expect(
      resolveDateTimeFilter({
        value: '2024-03-15T10:00:00Z',
        operand: ViewFilterOperand.IS_AFTER,
      }),
    ).toBe('2024-03-15T10:00:00Z');
  });

  it('should resolve relative date-time filter for IS_RELATIVE operand', () => {
    const result = resolveDateTimeFilter({
      value: 'PAST_7_DAY',
      operand: ViewFilterOperand.IS_RELATIVE,
    });

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('start');
    expect(result).toHaveProperty('end');
  });
});
