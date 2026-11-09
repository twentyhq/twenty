import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

// The app's Logger class is loaded by the global setup, so it is reached through an app instance rather than imported.
export const spyOnAppLogger = (): {
  logSpy: jest.SpyInstance;
  warnSpy: jest.SpyInstance;
} => {
  const appLoggerPrototype = Object.getPrototypeOf(
    (
      getAppProviderByClassName<SecureHttpClientService>(
        'SecureHttpClientService',
      ) as unknown as { logger: object }
    ).logger,
  );

  return {
    logSpy: jest.spyOn(appLoggerPrototype, 'log'),
    warnSpy: jest.spyOn(appLoggerPrototype, 'warn'),
  };
};
