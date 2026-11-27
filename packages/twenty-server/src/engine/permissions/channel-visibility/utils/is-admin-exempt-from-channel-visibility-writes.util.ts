import { FeatureFlagKey } from 'twenty-shared/types';

export const isAdminExemptFromChannelVisibilityWrites = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  !(
    featureFlagsMap[
      FeatureFlagKey.IS_CHANNEL_VISIBILITY_ENFORCED_ON_ADMIN_WRITES
    ] ?? false
  );
