/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

export const isRecordSharingEnabled = ({
  featureFlagsMap,
}: {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): boolean =>
  featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false;
