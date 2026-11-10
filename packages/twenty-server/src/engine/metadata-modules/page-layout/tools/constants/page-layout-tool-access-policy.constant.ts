import { PermissionFlagType } from 'twenty-shared/constants';

import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

export const PAGE_LAYOUT_TOOL_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: { withUser: true, withoutUser: true, withAgent: true },
  },
  requiredPermissionFlags: [PermissionFlagType.LAYOUTS],
};
