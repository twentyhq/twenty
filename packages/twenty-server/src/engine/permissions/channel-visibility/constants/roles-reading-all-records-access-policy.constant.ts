import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

export const ROLES_READING_ALL_RECORDS_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  },
  requiredPermissionFlags: [],
};
