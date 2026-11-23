import { type FeatureFlagKey } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { isApiKeyExemptFromChannelVisibility } from 'src/engine/permissions/channel-visibility/utils/is-api-key-exempt-from-channel-visibility.util';
import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';

export const isChannelVisibilityEnforcedThroughRules = ({
  featureFlagsMap,
  authContext,
}: {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  authContext: Pick<WorkspaceAuthContext, 'type'>;
}): boolean =>
  isChannelVisibilityRlsEnabled(featureFlagsMap) &&
  !(
    authContext.type === 'apiKey' &&
    isApiKeyExemptFromChannelVisibility(featureFlagsMap)
  );
