import {
  type RoleRestriction,
  type RoleRestrictionsBySource,
} from 'src/engine/twenty-orm/types/role-permission-config.type';

// The intersection keeps the first role's row-level predicates, so the order must stay stable
const ROLE_SOURCES_IN_INTERSECTION_ORDER = [
  'agent',
  'userWorkspace',
  'apiKey',
  'application',
] as const satisfies (keyof RoleRestrictionsBySource)[];

// null when the restrictions allow nothing
export const getRoleIdsToIntersect = (
  roleRestrictionsBySource: RoleRestrictionsBySource,
): string[] | null => {
  const roleRestrictions: RoleRestriction[] =
    ROLE_SOURCES_IN_INTERSECTION_ORDER.map(
      (source) => roleRestrictionsBySource[source],
    ).filter((roleRestriction) => roleRestriction !== undefined);

  if (roleRestrictions.length === 0 || roleRestrictions.includes(null)) {
    return null;
  }

  return [...new Set(roleRestrictions as string[])];
};
