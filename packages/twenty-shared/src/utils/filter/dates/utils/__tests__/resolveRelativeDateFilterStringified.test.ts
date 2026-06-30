import { resolveRelativeDateFilterStringified } from '@/utils/filter/dates/utils/resolveRelativeDateFilterStringified';
import { resolveRelativeDateTimeFilterStringified } from '@/utils/filter/dates/utils/resolveRelativeDateTimeFilterStringified';

describe('resolveRelativeDateFilterStringified', () => {
  it('should return null for empty string', () => {
    expect(resolveRelativeDateFilterStringified('')).toBeNull();
  });

  it('should return null for null', () => {
    expect(resolveRelativeDateFilterStringified(null)).toBeNull();
  });

  it('should return null for undefined', () => {
    expect(resolveRelativeDateFilterStringified(undefined)).toBeNull();
  });

  it('should return null for invalid filter string', () => {
    expect(resolveRelativeDateFilterStringified('INVALID')).toBeNull();
  });

  it('should resolve a valid PAST filter', () => {
    const result = resolveRelativeDateFilterStringified('PAST_7_DAY');

    expect(result).not.toBeNull();
    expect(result?.direction).toBe('PAST');
    expect(result?.start).toBeDefined();
    expect(result?.end).toBeDefined();
  });

  it('should resolve a valid NEXT filter', () => {
    const result = resolveRelativeDateFilterStringified('NEXT_3_MONTH');

    expect(result).not.toBeNull();
    expect(result?.direction).toBe('NEXT');
  });
});

describe('resolveRelativeDateTimeFilterStringified', () => {
  it('should return null for empty string', () => {
    expect(resolveRelativeDateTimeFilterStringified('')).toBeNull();
  });

  it('should return null for null', () => {
    expect(resolveRelativeDateTimeFilterStringified(null)).toBeNull();
  });

  it('should return null for invalid filter string', () => {
    expect(resolveRelativeDateTimeFilterStringified('INVALID')).toBeNull();
  });

  it('should resolve a valid PAST filter', () => {
    const result = resolveRelativeDateTimeFilterStringified('PAST_24_HOUR');

    expect(result).not.toBeNull();
    expect(result?.direction).toBe('PAST');
    expect(result?.start).toBeDefined();
    expect(result?.end).toBeDefined();
  });
});
