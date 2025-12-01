import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
  FeatureFlagKey.IS_NULL_EQUIVALENCE_ENABLED,
] as const satisfies FeatureFlagKey[];
