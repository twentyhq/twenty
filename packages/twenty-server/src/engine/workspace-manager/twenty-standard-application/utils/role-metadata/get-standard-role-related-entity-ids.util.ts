import { v4 } from 'uuid';

import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { type AllStandardRoleName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-role-name.type';

export type StandardRoleRelatedEntityIds = Record<
  AllStandardRoleName,
  { id: string }
>;

export const getStandardRoleRelatedEntityIds =
  (): StandardRoleRelatedEntityIds => {
    const result = {} as StandardRoleRelatedEntityIds;

    for (const roleName of Object.keys(
      STANDARD_ROLE,
    ) as AllStandardRoleName[]) {
      result[roleName] = { id: v4() };
    }

    return result;
  };

