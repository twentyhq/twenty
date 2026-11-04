import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

// The view permission guards and ViewToolAccessService check VIEWS per view,
// exempting the caller's own unlisted views
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
