import { escapeCssStringValue } from '@ui/data-display/Avatar/utils/escapeCssStringValue';

describe('escapeCssStringValue', () => {
  it('should return a plain URL unchanged', () => {
    expect(escapeCssStringValue('https://twenty-icons.com/apple.com')).toBe(
      'https://twenty-icons.com/apple.com',
    );
  });

  it('should escape double quotes', () => {
    expect(escapeCssStringValue('https://a.com/x"y')).toBe(
      'https://a.com/x\\"y',
    );
  });

  it('should escape backslashes before quotes so no double escaping occurs', () => {
    expect(escapeCssStringValue('a\\"b')).toBe('a\\\\\\"b');
  });

  it('should escape newline characters that would terminate a CSS string', () => {
    expect(escapeCssStringValue('a\nb\rc\fd')).toBe('a\\A b\\D c\\C d');
  });
});
