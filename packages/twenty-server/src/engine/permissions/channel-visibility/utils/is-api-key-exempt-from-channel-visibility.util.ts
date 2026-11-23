import { FeatureFlagKey } from 'twenty-shared/types';

import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';

// TODO(@charlesBochet): remove the API key channel visibility exemption after 2026-11-30
export const isApiKeyExemptFromChannelVisibility = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  isChannelVisibilityRlsEnabled(featureFlagsMap) &&
  !(
    featureFlagsMap[
      FeatureFlagKey.IS_CHANNEL_VISIBILITY_ENFORCED_ON_API_KEYS
    ] ?? false
  );
