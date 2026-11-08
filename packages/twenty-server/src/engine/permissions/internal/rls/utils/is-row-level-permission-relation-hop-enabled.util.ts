/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

// Querying through a hop relies on access groups, so a hop needs both flags
export const isRowLevelPermissionRelationHopEnabled = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  (featureFlagsMap[
    FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED
  ] ??
    false) &&
  (featureFlagsMap[FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED] ?? false);
