/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

import { isAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/is-access-groups-enabled.util';

export const isRlsRelationHopEnabled = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  (featureFlagsMap[
    FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED
  ] ??
    false) &&
  isAccessGroupsEnabled({ featureFlagsMap });
