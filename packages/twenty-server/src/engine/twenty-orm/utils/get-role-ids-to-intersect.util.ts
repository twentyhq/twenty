import { isDefined } from 'twenty-shared/utils';

import { ROLE_SOURCES_IN_INTERSECTION_ORDER } from 'src/engine/twenty-orm/constants/role-sources-in-intersection-order.constant';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { isDenyingRoleIdsBySource } from 'src/engine/twenty-orm/utils/is-denying-role-ids-by-source.util';

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
