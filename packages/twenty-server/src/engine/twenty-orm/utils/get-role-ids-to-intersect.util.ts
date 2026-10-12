import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

// The intersection keeps the first role's row-level predicates, so the order must stay stable
const ROLE_SOURCES_IN_INTERSECTION_ORDER = [
  'agentRoleId',
  'userWorkspaceRoleId',
  'apiKeyRoleId',
  'applicationRoleId',
] as const satisfies (keyof RoleIdsBySource)[];

// null when the config allows nothing
export const getRoleIdsToIntersect = (
  roleIdsBySource: RoleIdsBySource,
): string[] | null => {
  const roleIds: (string | null)[] = ROLE_SOURCES_IN_INTERSECTION_ORDER.map(
    (source) => roleIdsBySource[source],
  ).filter((roleId) => roleId !== undefined);

  if (roleIds.length === 0 || roleIds.includes(null)) {
    return null;
  }

  return [...new Set(roleIds as string[])];
};
