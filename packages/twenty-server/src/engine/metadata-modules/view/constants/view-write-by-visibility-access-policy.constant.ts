import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

// VIEWS is only required on workspace-visible views, which the view
// permission guards check per view
export const VIEW_WRITE_BY_VISIBILITY_ACCESS_POLICY: AccessPolicy = {
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
  requiredPermissionFlags: [],
};
