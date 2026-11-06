/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

// Several roles combine as an intersection, so every one of them needs the
// permission for the restrictions to be lifted
export const canRolesAccessAllRecords = ({
  roleIds,
  roleIdsWithAllRecordsAccess,
}: {
  roleIds: string[];
  roleIdsWithAllRecordsAccess: string[];
}): boolean =>
  isNonEmptyArray(roleIds) &&
  roleIds.every((roleId) => roleIdsWithAllRecordsAccess.includes(roleId));
