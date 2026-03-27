import { FeatureFlagKey } from 'twenty-shared/types';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_ATTACHMENT_MIGRATED,
  FeatureFlagKey.IS_NOTE_TARGET_MIGRATED,
  FeatureFlagKey.IS_TASK_TARGET_MIGRATED,
] as const satisfies FeatureFlagKey[];
