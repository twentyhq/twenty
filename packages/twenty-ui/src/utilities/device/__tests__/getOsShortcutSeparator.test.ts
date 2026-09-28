import { type MockInstance, vi } from 'vitest';

import { getOsShortcutSeparator } from '../getOsShortcutSeparator';

describe('getOsShortcutSeparator', () => {
  let userAgentSpy: MockInstance<() => string>;

  beforeEach(() => {
    userAgentSpy = vi.spyOn(window.navigator, 'userAgent', 'get');
  });

  afterEach(() => {
    userAgentSpy.mockRestore();
  });

  it('should return space for Windows', () => {
    userAgentSpy.mockReturnValue(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    );
    expect(getOsShortcutSeparator()).toBe(' ');
  });

  it('should return empty string for Mac', () => {
    userAgentSpy.mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    );
    expect(getOsShortcutSeparator()).toBe('');
  });

  it('should return empty string for iPad', () => {
    userAgentSpy.mockReturnValue(
      'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    );
    expect(getOsShortcutSeparator()).toBe('');
  });
});
