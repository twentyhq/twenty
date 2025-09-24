import { isEmptyValue } from 'src/modules/workflow/workflow-trigger/utils/is-empty-value.util';

describe('isEmptyValue', () => {
  it('should return true for null', () => {
    const result = isEmptyValue(null);

    expect(result).toBe(true);
  });

  it('should return true for undefined', () => {
    const result = isEmptyValue(undefined);

    expect(result).toBe(true);
  });

  it('should return true for empty string', () => {
    const result = isEmptyValue('');

    expect(result).toBe(true);
  });

  it('should return true for whitespace-only string', () => {
    const result = isEmptyValue('   ');

    expect(result).toBe(true);
  });

  it('should return true for string with tabs and newlines', () => {
    const result = isEmptyValue('\t\n\r ');

    expect(result).toBe(true);
  });

  it('should return false for non-empty string', () => {
    const result = isEmptyValue('hello');

    expect(result).toBe(false);
  });

  it('should return false for string with content and whitespace', () => {
    const result = isEmptyValue('  hello  ');

    expect(result).toBe(false);
  });

  it('should return true for empty array', () => {
    const result = isEmptyValue([]);

    expect(result).toBe(true);
  });

  it('should return false for non-empty array', () => {
    const result = isEmptyValue(['item']);

    expect(result).toBe(false);
  });

  it('should return true for empty object', () => {
    const result = isEmptyValue({});

    expect(result).toBe(true);
  });

  it('should return false for non-empty object', () => {
    const result = isEmptyValue({ key: 'value' });

    expect(result).toBe(false);
  });

  it('should return false for boolean false', () => {
    const result = isEmptyValue(false);

    expect(result).toBe(false);
  });

  it('should return false for boolean true', () => {
    const result = isEmptyValue(true);

    expect(result).toBe(false);
  });

  it('should return false for number zero', () => {
    const result = isEmptyValue(0);

    expect(result).toBe(false);
  });

  it('should return false for positive number', () => {
    const result = isEmptyValue(42);

    expect(result).toBe(false);
  });

  it('should return false for negative number', () => {
    const result = isEmptyValue(-1);

    expect(result).toBe(false);
  });

  it('should return false for Date object', () => {
    const result = isEmptyValue(new Date());

    expect(result).toBe(false);
  });
});
