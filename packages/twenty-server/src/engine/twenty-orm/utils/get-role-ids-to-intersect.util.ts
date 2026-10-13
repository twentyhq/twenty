import { isDefined } from 'twenty-shared/utils';

import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { isDenyingRoleIdsBySource } from 'src/engine/twenty-orm/utils/is-denying-role-ids-by-source.util';

// Keyed by every source so none can be left out. The key order is the intersection order,
// which must stay stable because the intersection keeps the first role's row-level predicates
const ROLE_SOURCES_IN_INTERSECTION_ORDER = Object.keys({
  agentRoleId: true,
  userWorkspaceRoleId: true,
  apiKeyRoleId: true,
  applicationRoleId: true,
} satisfies Record<keyof RoleIdsBySource, true>) as (keyof RoleIdsBySource)[];

// null when the config allows nothing
export const getRoleIdsToIntersect = (
  roleIdsBySource: RoleIdsBySource,
): string[] | null => {
  if (isDenyingRoleIdsBySource(roleIdsBySource)) {
    return null;
  }

  return [
    ...new Set(
      ROLE_SOURCES_IN_INTERSECTION_ORDER.map(
        (source) => roleIdsBySource[source],
      ).filter(isDefined),
    ),
  ];
};
