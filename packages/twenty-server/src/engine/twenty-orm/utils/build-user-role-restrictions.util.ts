import { type RoleRestrictionsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { resolveApplicationRoleRestriction } from 'src/engine/twenty-orm/utils/resolve-application-role-restriction.util';

// An application acting for a user is bounded by both the user's role and its own
export const buildUserRoleRestrictions = ({
  userRoleId,
  application,
}: {
  userRoleId: string | null | undefined;
  application: { defaultRoleId: string | null } | undefined;
}): RoleRestrictionsBySource => ({
  userWorkspace: userRoleId ?? null,
  ...resolveApplicationRoleRestriction({ application, isActingAlone: false }),
});
