import { parseBooleanFromStringValue } from '@/workflow/utils/parseBooleanFromStringValue';

describe('parseBooleanFromStringValue', () => {
  it('should return true for "true" string', () => {
    expect(parseBooleanFromStringValue('true')).toBe(true);
  });

  it('should return false for "false" string', () => {
    expect(parseBooleanFromStringValue('false')).toBe(false);
  });

  it('should return the original value for non-boolean strings', () => {
    expect(parseBooleanFromStringValue('hello')).toBe('hello');
  });

  it('should return the original value for numbers', () => {
    expect(parseBooleanFromStringValue(42)).toBe(42);
  });

  it('should return the original value for null', () => {
    expect(parseBooleanFromStringValue(null)).toBeNull();
  });
});
