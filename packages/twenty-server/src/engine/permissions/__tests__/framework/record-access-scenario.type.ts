import { type ObjectPermissionAction } from 'twenty-shared/application';

import { type GivenPrincipals } from 'src/engine/permissions/__tests__/framework/given-principals.util';

export type RoleGrant = 'none' | 'rowLevel' | 'allRecords';

export type RestrictedFieldsByRoleId = Record<
  string,
  Record<string, { canRead: boolean | null; canUpdate: boolean | null }>
>;

export type RecordAccessScenario = GivenPrincipals<RoleGrant> & {
  isSharingEnabled?: boolean;
  aiRunScope?: 'none' | 'allRecords';
  disabledObjectPermissionActions?: ObjectPermissionAction[];
  isObjectOwnedByMainApplication?: boolean;
  restrictedFieldsByRoleId?: RestrictedFieldsByRoleId;
};
