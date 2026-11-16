import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const mockServerAdminWorkspaceId = (serverAdminWorkspaceId: string) => {
  const twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
    'TwentyConfigService',
  );
  const readConfig = twentyConfigService.get.bind(twentyConfigService);

  jest
    .spyOn(twentyConfigService, 'get')
    .mockImplementation((key) =>
      key === 'SERVER_ADMIN_WORKSPACE_ID'
        ? serverAdminWorkspaceId
        : readConfig(key),
    );
};
