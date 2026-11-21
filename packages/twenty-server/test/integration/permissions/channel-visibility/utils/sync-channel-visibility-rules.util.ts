import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ChannelVisibilityRuleSyncService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const syncChannelVisibilityRules = () =>
  getAppProviderByClassName<ChannelVisibilityRuleSyncService>(
    'ChannelVisibilityRuleSyncService',
  ).syncWorkspace(SEED_APPLE_WORKSPACE_ID);
