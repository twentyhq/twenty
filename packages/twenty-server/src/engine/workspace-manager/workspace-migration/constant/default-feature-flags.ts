import { FeatureFlagKey } from 'twenty-shared/types';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
  FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED,
  FeatureFlagKey.IS_PRIVATE_CHAT_THREAD_ENABLED,
] as const satisfies FeatureFlagKey[];
