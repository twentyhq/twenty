import { FeatureFlagKey } from 'twenty-shared/types';

// TODO(@charlesBochet): remove after 2026-12-27. Temporary channel write access for admins and API keys, only to unblock customers who reported broken links, merges and deletes
export const isAdminExemptFromChannelVisibilityWrites = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  !(
    featureFlagsMap[
      FeatureFlagKey.IS_CHANNEL_VISIBILITY_ENFORCED_ON_ADMIN_WRITES
    ] ?? false
  );
