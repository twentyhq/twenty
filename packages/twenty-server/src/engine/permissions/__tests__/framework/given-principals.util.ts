import { type ObjectPermissionAction } from 'twenty-shared/application';
import { type ObjectRecordsOperationType } from 'twenty-shared/types';

export type RoleGrant = 'none' | 'rowLevel' | 'allRecords';

export const RECORD_OPERATIONS = [
  'select',
  'update',
  'soft-delete',
  'restore',
  'delete',
] as const satisfies ObjectRecordsOperationType[];

export type RecordOperation = (typeof RECORD_OPERATIONS)[number];

export const EVERY_OPERATION: RecordOperation[] = [...RECORD_OPERATIONS];
export const NO_OPERATION: RecordOperation[] = [];

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

export type RestrictedFieldsByRoleId = Record<
  string,
  Record<string, { canRead: boolean | null; canUpdate: boolean | null }>
>;

export type RecordAccessWorld = GivenPrincipals<RoleGrant> & {
  isSharingEnabled: boolean;
  aiRunScope?: 'none' | 'allRecords';
  disabledObjectPermissionActions?: ObjectPermissionAction[];
  isObjectOwnedByMainApplication?: boolean;
  restrictedFieldsByRoleId?: RestrictedFieldsByRoleId;
};

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

// Every shape an auth context can resolve to, plus the bare role that has no auth context
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
