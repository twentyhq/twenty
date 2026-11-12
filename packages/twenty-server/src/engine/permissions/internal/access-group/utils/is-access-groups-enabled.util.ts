/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

export const isAccessGroupsEnabled = ({
  featureFlagsMap,
}: {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): boolean =>
  featureFlagsMap[FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED] ?? false;
