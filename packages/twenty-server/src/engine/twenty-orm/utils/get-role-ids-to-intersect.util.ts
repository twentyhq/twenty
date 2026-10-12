import {
  type RoleRestriction,
  type RoleIdsBySource,
} from 'src/engine/twenty-orm/types/role-permission-config.type';

// The intersection keeps the first role's row-level predicates, so the order must stay stable
const ROLE_SOURCES_IN_INTERSECTION_ORDER = [
  'agentRoleId',
  'userWorkspaceRoleId',
  'apiKeyRoleId',
  'applicationRoleId',
] as const satisfies (keyof RoleIdsBySource)[];

// null when the restrictions allow nothing
export const getRoleIdsToIntersect = (
  roleIdsBySource: RoleIdsBySource,
): string[] | null => {
  const roleRestrictions: RoleRestriction[] =
    ROLE_SOURCES_IN_INTERSECTION_ORDER.map(
      (source) => roleIdsBySource[source],
    ).filter((roleRestriction) => roleRestriction !== undefined);

  if (roleRestrictions.length === 0 || roleRestrictions.includes(null)) {
    return null;
  }

  return [...new Set(roleRestrictions as string[])];
};
