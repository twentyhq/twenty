import { FeatureFlagKey } from 'twenty-shared/types';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_DATASOURCE_MIGRATED,
] as const satisfies FeatureFlagKey[];
