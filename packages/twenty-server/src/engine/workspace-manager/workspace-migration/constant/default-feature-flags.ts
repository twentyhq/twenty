import { FeatureFlagKey } from 'twenty-shared/types';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED,
  FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED,
  FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
] as const satisfies FeatureFlagKey[];
