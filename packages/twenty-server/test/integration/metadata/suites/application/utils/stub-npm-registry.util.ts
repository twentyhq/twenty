import { type AxiosInstance } from 'axios';
import { type StubbedRegistryPackage } from 'test/integration/metadata/suites/application/utils/build-npm-registry-package.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type NpmRegistryStub = {
  requestedUrls: string[];
  restore: () => void;
};

// Serves a single package from the running server's registry client, so an
// install never reaches npm. Requests to any other host fall through to the
// real client, leaving unrelated outbound traffic untouched.
export const stubNpmRegistry = (
  registryPackage: StubbedRegistryPackage,
): NpmRegistryStub => {
  const secureHttpClientService =
    getAppProviderByClassName<SecureHttpClientService>(
      'SecureHttpClientService',
    );
  const registryBaseUrl = getAppProviderByClassName<TwentyConfigService>(
    'TwentyConfigService',
  )
    .get('APP_REGISTRY_URL')
    .replace(/\/$/, '');

  const requestedUrls: string[] = [];
  const realGetHttpClient = secureHttpClientService.getHttpClient.bind(
    secureHttpClientService,
  );

  const spy = jest
    .spyOn(secureHttpClientService, 'getHttpClient')
    .mockImplementation((config, context) => {
      const client = realGetHttpClient(config, context);
      const realGet = client.get.bind(client);

      client.get = (async (url: string, requestConfig?: unknown) => {
        if (typeof url !== 'string' || !url.startsWith(registryBaseUrl)) {
          return realGet(url, requestConfig);
        }

        requestedUrls.push(url);

        if (url === registryPackage.tarballUrl) {
          return { data: registryPackage.tarballBuffer };
        }

        return { data: registryPackage.metadata };
      }) as AxiosInstance['get'];

      return client;
    });

  return {
    requestedUrls,
    restore: () => spy.mockRestore(),
  };
};
