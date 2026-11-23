import { FeatureFlagKey } from 'twenty-shared/types';

import { isAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/is-access-groups-enabled.util';
import { isRelatedRecordPathsEnabled } from 'src/engine/permissions/internal/related-record-path/utils/is-related-record-paths-enabled.util';

// Links to records are created through a create-only grant, which the update
// check would refuse while create permissions are off
export const isAgentChatRlsEnabled = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  (featureFlagsMap[FeatureFlagKey.IS_AGENT_CHAT_RLS_ENABLED] ?? false) &&
  (featureFlagsMap[FeatureFlagKey.IS_CREATE_RECORDS_PERMISSION_ENABLED] ??
    false) &&
  isAccessGroupsEnabled({ featureFlagsMap }) &&
  isRelatedRecordPathsEnabled({ featureFlagsMap });
