import { FeatureFlagKey } from 'twenty-shared/types';

// the rules reach messages and events through their channel associations, a relation hop
export const isChannelVisibilityRlsEnabled = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  (featureFlagsMap[FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED] ??
    false) &&
  (featureFlagsMap[
    FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED
  ] ??
    false);
