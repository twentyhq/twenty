import { type FeatureFlagKey } from 'twenty-shared/types';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';

// Only workspace members always read channel records through an individual role; other callers may still hold role wide access
export const isChannelVisibilityEnforcedByIndividualRole = ({
  featureFlagsMap,
  authContext,
}: {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  authContext: WorkspaceAuthContext;
}): boolean =>
  isChannelVisibilityRlsEnabled(featureFlagsMap) &&
  isUserAuthContext(authContext);
