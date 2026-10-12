import { isDefined } from 'twenty-shared/utils';

import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { isDenyingRoleIdsBySource } from 'src/engine/twenty-orm/utils/is-denying-role-ids-by-source.util';

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
