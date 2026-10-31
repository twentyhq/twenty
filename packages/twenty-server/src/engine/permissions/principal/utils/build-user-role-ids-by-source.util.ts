import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type RoleIdsBySource } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { resolveApplicationRoleId } from 'src/engine/permissions/principal/utils/resolve-application-role-id.util';

// An application acting for a user is bounded by both the user's role and its own
export const buildUserRoleIdsBySource = ({
  userRoleId,
  application,
}: {
  userRoleId: string | null | undefined;
  application:
    | Pick<FlatApplication, 'defaultRoleId' | 'sourceType'>
    | undefined;
}): RoleIdsBySource => ({
  userWorkspaceRoleId: userRoleId ?? null,
  ...resolveApplicationRoleId({ application }),
});
