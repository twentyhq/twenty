import {
  agent,
  apiKey,
  application,
  bareRole,
  CUSTOM_APPLICATION,
  type GivenApplicationPrincipal,
  type GivenLimitingPrincipal,
  type GivenPrincipals,
  NO_LIMITING_PRINCIPAL,
  OAUTH_APPLICATION,
  SAME_APPLICATION_AS_MAIN,
  webhook,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';

export const buildReachablePrincipals = <TRole>({
  roles,
}: {
  roles: TRole[];
}): GivenPrincipals<TRole>[] =>
  roles.flatMap((mainRole) => [
    ...[workspaceMember, apiKey].flatMap((buildMainPrincipal) => {
      const limitingPrincipals: GivenLimitingPrincipal<TRole>[] = [
        NO_LIMITING_PRINCIPAL,
        ...roles.map((role) => agent({ role })),
      ];
      const applicationPrincipals: GivenApplicationPrincipal<TRole>[] = [
        CUSTOM_APPLICATION,
        // An OAuth application borrows the role of a member, an API key has none to lend
        ...(buildMainPrincipal === workspaceMember ? [OAUTH_APPLICATION] : []),
        ...roles.map((role) => application({ role })),
      ];

      return limitingPrincipals.flatMap((limitingPrincipal) =>
        applicationPrincipals.map((applicationPrincipal) => ({
          mainPrincipal: buildMainPrincipal({ role: mainRole }),
          limitingPrincipal,
          applicationPrincipal,
        })),
      );
    }),
    {
      mainPrincipal: application({ role: mainRole }),
      limitingPrincipal: NO_LIMITING_PRINCIPAL,
      applicationPrincipal: SAME_APPLICATION_AS_MAIN,
    },
    ...roles.map((role) => ({
      mainPrincipal: agent({ role: mainRole }),
      limitingPrincipal: NO_LIMITING_PRINCIPAL,
      applicationPrincipal: application({ role }),
    })),
    {
      mainPrincipal: webhook({ role: mainRole }),
      limitingPrincipal: NO_LIMITING_PRINCIPAL,
      applicationPrincipal: CUSTOM_APPLICATION,
    },
    {
      mainPrincipal: bareRole({ role: mainRole }),
      limitingPrincipal: NO_LIMITING_PRINCIPAL,
      applicationPrincipal: CUSTOM_APPLICATION,
    },
  ]);
