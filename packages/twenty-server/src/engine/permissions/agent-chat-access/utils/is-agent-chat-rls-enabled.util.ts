import { FeatureFlagKey } from 'twenty-shared/types';

import { isAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/is-access-groups-enabled.util';
import { isRelatedRecordPathsEnabled } from 'src/engine/permissions/internal/related-record-path/utils/is-related-record-paths-enabled.util';

export const isAgentChatRlsEnabled = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  (featureFlagsMap[FeatureFlagKey.IS_AGENT_CHAT_RLS_ENABLED] ?? false) &&
  isAccessGroupsEnabled({ featureFlagsMap }) &&
  isRelatedRecordPathsEnabled({ featureFlagsMap });
