import { PermissionFlagType } from 'twenty-shared/constants';

import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

// Only callers acting for a workspace member, whose email quota the send checks use
export const MESSAGE_CAMPAIGN_SEND_PREVIEW_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  },
  requiredPermissionFlags: [PermissionFlagType.WORKSPACE],
};
