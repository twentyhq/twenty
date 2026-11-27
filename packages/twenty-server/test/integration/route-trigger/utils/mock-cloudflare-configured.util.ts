import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const mockCloudflareConfigured = () => {
  const twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
    'TwentyConfigService',
  );
  const readConfig = twentyConfigService.get.bind(twentyConfigService);

  return jest
    .spyOn(twentyConfigService, 'get')
    .mockImplementation((key) =>
      key === 'CLOUDFLARE_API_KEY' ? 'cloudflare-api-key' : readConfig(key),
    );
};
