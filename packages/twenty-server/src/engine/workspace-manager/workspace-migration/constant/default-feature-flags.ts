import { FeatureFlagKey } from 'twenty-shared/types';

export const DEFAULT_FEATURE_FLAGS = [
  FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT,
  FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
  FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED,
  FeatureFlagKey.IS_GETTING_STARTED_ENABLED,
] as const satisfies FeatureFlagKey[];
