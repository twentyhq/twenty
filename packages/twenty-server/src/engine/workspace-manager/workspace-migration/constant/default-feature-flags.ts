import { FeatureFlagKey } from 'twenty-shared/types';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED,
  FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED,
] as const satisfies FeatureFlagKey[];
