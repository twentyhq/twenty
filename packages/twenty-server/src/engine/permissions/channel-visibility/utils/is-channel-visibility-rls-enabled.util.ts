import { FeatureFlagKey } from 'twenty-shared/types';

export const isChannelVisibilityRlsEnabled = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  featureFlagsMap[FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED] ?? false;
