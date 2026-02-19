import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_ATTACHMENT_MIGRATED,
  FeatureFlagKey.IS_NOTE_TARGET_MIGRATED,
  FeatureFlagKey.IS_TASK_TARGET_MIGRATED,
  FeatureFlagKey.IS_CORE_PICTURE_MIGRATED,
  FeatureFlagKey.IS_FILES_FIELD_MIGRATED,
  FeatureFlagKey.IS_OTHER_FILE_MIGRATED,
] as const satisfies FeatureFlagKey[];
