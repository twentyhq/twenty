import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED,
  FeatureFlagKey.IS_ATTACHMENT_MIGRATED,
  FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_ENABLED,
] as const satisfies FeatureFlagKey[];
