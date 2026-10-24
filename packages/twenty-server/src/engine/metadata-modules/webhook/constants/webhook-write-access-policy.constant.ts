import { PermissionFlagType } from 'twenty-shared/constants';

import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

export const WEBHOOK_WRITE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
};
