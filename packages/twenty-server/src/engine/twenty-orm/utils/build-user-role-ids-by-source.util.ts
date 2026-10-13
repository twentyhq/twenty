import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { resolveApplicationRoleId } from 'src/engine/twenty-orm/utils/resolve-application-role-id.util';

// An application acting for a user is bounded by both the user's role and its own
export const buildUserRoleIdsBySource = ({
  userRoleId,
  application,
}: {
  userRoleId: string | null | undefined;
  application: { defaultRoleId: string | null } | undefined;
}): RoleIdsBySource => ({
  userWorkspaceRoleId: userRoleId ?? null,
  ...resolveApplicationRoleId({
    application,
    isMissingApplicationRoleTolerated: true,
  }),
});
