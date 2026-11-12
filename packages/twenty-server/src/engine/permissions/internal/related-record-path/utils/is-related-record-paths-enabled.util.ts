/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

export const isRelatedRecordPathsEnabled = ({
  featureFlagsMap,
}: {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): boolean =>
  featureFlagsMap[FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED] ?? false;
