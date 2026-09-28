import { afterEach, describe, expect, it, vi } from 'vitest';

import { getUserDevice } from '../getUserDevice';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getUserDevice', () => {
  it.each([
    undefined,
    null,
    {},
    { userAgent: undefined },
    { userAgent: null },
    { userAgent: '' },
  ])(
    'returns unknown when platform information is unavailable: %j',
    (navigatorValue) => {
      vi.stubGlobal('navigator', navigatorValue);
      expect(getUserDevice()).toBe('unknown');
    },
  );

  it.each(
    [
      ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'mac'],
      ['macOS', 'mac'],
      ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'windows'],
      ['Mozilla/5.0 (X11; Linux x86_64)', 'linux'],
      ['Android', 'android'],
      ['iOS', 'ios'],
      ['iPhone', 'ios'],
      ['iPad', 'ios'],
      ['Unrecognized platform', 'unknown'],
    ].map(([userAgent, expectedDevice]) => ({ userAgent, expectedDevice })),
  )('preserves detection for $userAgent', ({ userAgent, expectedDevice }) => {
    vi.stubGlobal('navigator', { userAgent });
    expect(getUserDevice()).toBe(expectedDevice);
  });
});
