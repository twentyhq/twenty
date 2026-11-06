export type GivenMainPrincipal<TRole> = {
  type:
    | 'workspaceMember'
    | 'apiKey'
    | 'agent'
    | 'application'
    | 'webhook'
    | 'role';
  role: TRole;
};

export type GivenLimitingPrincipal<TRole> =
  | { type: 'agent'; role: TRole }
  | { type: 'none' };

export type GivenApplicationPrincipal<TRole> =
  | { type: 'application'; role: TRole }
  | { type: 'oauthApplication' }
  | { type: 'sameApplicationAsMain' }
  | { type: 'customApplication' };

export type GivenPrincipals<TRole> = {
  mainPrincipal: GivenMainPrincipal<TRole>;
  limitingPrincipal: GivenLimitingPrincipal<TRole>;
  applicationPrincipal: GivenApplicationPrincipal<TRole>;
};

export type PrincipalSlot = keyof GivenPrincipals<unknown>;

export const workspaceMember = <TRole>({ role }: { role: TRole }) => ({
  type: 'workspaceMember' as const,
  role,
});

export const apiKey = <TRole>({ role }: { role: TRole }) => ({
  type: 'apiKey' as const,
  role,
});

export const agent = <TRole>({ role }: { role: TRole }) => ({
  type: 'agent' as const,
  role,
});

export const application = <TRole>({ role }: { role: TRole }) => ({
  type: 'application' as const,
  role,
});

export const webhook = <TRole>({ role }: { role: TRole }) => ({
  type: 'webhook' as const,
  role,
});

export const bareRole = <TRole>({ role }: { role: TRole }) => ({
  type: 'role' as const,
  role,
});

export const NO_LIMITING_PRINCIPAL = { type: 'none' as const };
export const CUSTOM_APPLICATION = { type: 'customApplication' as const };
export const OAUTH_APPLICATION = { type: 'oauthApplication' as const };
export const SAME_APPLICATION_AS_MAIN = {
  type: 'sameApplicationAsMain' as const,
};

export const findHeldRoles = <TRole>({
  mainPrincipal,
  limitingPrincipal,
  applicationPrincipal,
}: GivenPrincipals<TRole>): TRole[] => [
  mainPrincipal.role,
  ...(limitingPrincipal.type === 'agent' ? [limitingPrincipal.role] : []),
  ...(applicationPrincipal.type === 'application'
    ? [applicationPrincipal.role]
    : []),
];
