import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const mockConfigVariables = (overrides: Partial<ConfigVariables>) => {
  const twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
    'TwentyConfigService',
  );
  // Reads through the prototype so a second call does not wrap the first mock.
  const readConfig =
    TwentyConfigService.prototype.get.bind(twentyConfigService);

  jest
    .spyOn(twentyConfigService, 'get')
    .mockImplementation((key) =>
      key in overrides ? overrides[key] : readConfig(key),
    );
};
