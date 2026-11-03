import { FeatureFlagKey } from 'twenty-shared/types';

export const hasDirectMessageIdentityStorage = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): boolean =>
  featureFlagsMap[
    FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED
  ] ?? false;
