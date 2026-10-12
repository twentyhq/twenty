import { isDefined } from 'twenty-shared/utils';

import { type RoleRestrictionsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

// An application acting for a user is bounded by both the user's role and its own
export const buildUserRoleRestrictions = ({
  userRoleId,
  applicationRoleId,
}: {
  userRoleId: string | null | undefined;
  applicationRoleId: string | null | undefined;
}): RoleRestrictionsBySource => ({
  userWorkspace: userRoleId ?? null,
  ...(isDefined(applicationRoleId) && { application: applicationRoleId }),
});
