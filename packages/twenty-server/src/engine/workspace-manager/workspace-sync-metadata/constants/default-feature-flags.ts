import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED,
] as const satisfies FeatureFlagKey[];
