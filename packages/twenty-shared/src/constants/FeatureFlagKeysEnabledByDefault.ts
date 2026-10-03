import { FeatureFlagKey } from '@/types/FeatureFlagKey';

// Flags that guard existing behavior: a workspace without a row for them
// keeps that behavior, and only an explicit false turns it off
export const FEATURE_FLAG_KEYS_ENABLED_BY_DEFAULT: FeatureFlagKey[] = [
  FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED,
];
