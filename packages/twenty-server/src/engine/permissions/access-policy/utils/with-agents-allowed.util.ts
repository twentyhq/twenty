import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';

// Tools are available to agents
export const withAgentsAllowed = (
  authPrincipals: AuthPrincipalGuardConfig,
): AuthPrincipalGuardConfig => {
  const { application } = authPrincipals;

  if (application === false) {
    return authPrincipals;
  }

  return {
    ...authPrincipals,
    application:
      application === true
        ? { withUser: true, withoutUser: true, withAgent: true }
        : { ...application, withAgent: true },
  };
};
