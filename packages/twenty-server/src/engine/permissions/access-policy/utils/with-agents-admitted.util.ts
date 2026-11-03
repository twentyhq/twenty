import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';

// Temporary hack: tools admit agents wherever the policy admits the application, which
// `application: true` leaves out. Remove once AuthPrincipalGuardConfig makes withAgent explicit
export const withAgentsAdmitted = (
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
