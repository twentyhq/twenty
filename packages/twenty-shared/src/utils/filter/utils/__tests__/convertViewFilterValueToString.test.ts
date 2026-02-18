import { convertViewFilterValueToString } from '@/utils/filter/utils/convertViewFilterValueToString';

describe('convertViewFilterValueToString', () => {
  it('should return string values as-is', () => {
    expect(convertViewFilterValueToString('hello')).toBe('hello');
  });

  it('should stringify non-string values', () => {
    expect(convertViewFilterValueToString(42)).toBe('42');
  });

  it('should stringify objects', () => {
    expect(convertViewFilterValueToString({ key: 'value' })).toBe(
      '{"key":"value"}',
    );
  });

  it('should stringify null as empty string', () => {
    expect(convertViewFilterValueToString(null)).toBe('""');
  });

  it('should stringify undefined as empty string', () => {
    expect(convertViewFilterValueToString(undefined)).toBe('""');
  });
});
