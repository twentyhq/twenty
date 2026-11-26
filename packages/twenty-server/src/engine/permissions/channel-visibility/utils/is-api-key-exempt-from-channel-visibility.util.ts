import { FeatureFlagKey } from 'twenty-shared/types';

// TODO(@charlesBochet): remove the API key channel visibility exemption after 2026-11-30
export const isApiKeyExemptFromChannelVisibility = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  !(
    featureFlagsMap[
      FeatureFlagKey.IS_CHANNEL_VISIBILITY_ENFORCED_ON_API_KEYS
    ] ?? false
  );
