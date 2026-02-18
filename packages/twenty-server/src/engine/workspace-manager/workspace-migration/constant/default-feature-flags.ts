import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_ATTACHMENT_MIGRATED,
  FeatureFlagKey.IS_NOTE_TARGET_MIGRATED,
  FeatureFlagKey.IS_TASK_TARGET_MIGRATED,
  FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED,
] as const satisfies FeatureFlagKey[];
