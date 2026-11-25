import { FeatureFlagKey } from 'twenty-shared/types';

export const isChannelVisibilityRlsEnabled = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  [
    FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED,
    FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
    FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
  ].every((featureFlagKey) => featureFlagsMap[featureFlagKey] ?? false);
