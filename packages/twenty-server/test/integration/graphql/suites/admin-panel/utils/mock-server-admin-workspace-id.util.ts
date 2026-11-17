import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const mockServerAdminWorkspaceId = (
  serverAdminWorkspaceId: string | undefined,
) => {
  const twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
    'TwentyConfigService',
  );
  // Reads through the prototype so a second call does not wrap the first mock.
  const readConfig =
    TwentyConfigService.prototype.get.bind(twentyConfigService);

  jest
    .spyOn(twentyConfigService, 'get')
    .mockImplementation((key) =>
      key === 'SERVER_ADMIN_WORKSPACE_ID'
        ? serverAdminWorkspaceId
        : readConfig(key),
    );
};
