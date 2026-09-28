import { type MockInstance, vi } from 'vitest';

import { getUserDevice } from '../getUserDevice';

describe('getUserDevice', () => {
  let userAgentSpy: MockInstance<() => string>;

  beforeEach(() => {
    userAgentSpy = vi.spyOn(window.navigator, 'userAgent', 'get');
  });

  afterEach(() => {
    userAgentSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it.each([undefined, null, {}, { userAgent: undefined }, { userAgent: null }])(
    'should return unknown when the user agent is unavailable: %j',
    (navigatorValue) => {
      vi.stubGlobal('navigator', navigatorValue);
      expect(getUserDevice()).toBe('unknown');
    },
  );

  it.each([
    {
      platform: 'Mac',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      expectedDevice: 'mac',
    },
    {
      platform: 'Windows',
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
      expectedDevice: 'windows',
    },
    {
      platform: 'Linux',
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      expectedDevice: 'linux',
    },
    {
      platform: 'Android',
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
      expectedDevice: 'android',
    },
    {
      platform: 'iPhone',
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      expectedDevice: 'ios',
    },
    {
      platform: 'iPad',
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      expectedDevice: 'ios',
    },
    {
      platform: 'an empty user agent',
      userAgent: '',
      expectedDevice: 'unknown',
    },
    {
      platform: 'an unrecognized platform',
      userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0)',
      expectedDevice: 'unknown',
    },
  ])(
    'should return $expectedDevice for $platform',
    ({ userAgent, expectedDevice }) => {
      userAgentSpy.mockReturnValue(userAgent);
      expect(getUserDevice()).toBe(expectedDevice);
    },
  );
});
