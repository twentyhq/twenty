import { PermissionFlagType } from 'twenty-shared/constants';

import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

// Campaign sends run for a workspace member and use their email quota
export const MESSAGE_CAMPAIGN_SEND_ACCESS_POLICY: AccessPolicy = {
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
