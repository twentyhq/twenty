/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

export const canSetRecordPrivacy = ({
  featureFlagsMap,
}: {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): boolean =>
  featureFlagsMap[FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED] ?? false;
