import { getOsShortcutSeparator } from '../getOsShortcutSeparator';

describe('getOsShortcutSeparator', () => {
  it('should return space for Windows', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
      configurable: true,
    });
    expect(getOsShortcutSeparator()).toBe(' ');
  });

  it('should return empty string for Mac', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      configurable: true,
    });
    expect(getOsShortcutSeparator()).toBe('');
  });
});
