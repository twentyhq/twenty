import { FeatureFlagKey } from 'twenty-shared/types';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
  FeatureFlagKey.IS_WORKFLOW_VERSION_IN_CORE_ENABLED,
  FeatureFlagKey.IS_WORKFLOW_DISPATCH_FROM_CORE_ENABLED,
] as const satisfies FeatureFlagKey[];
