import { FeatureFlagKey } from 'twenty-shared/types';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
  FeatureFlagKey.IS_INITIAL_OBJECT_VIEW_ENABLED,
] as const satisfies FeatureFlagKey[];
