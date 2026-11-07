/* @license Enterprise */

import { createHash } from 'crypto';

import { type AccessGroupMemberFieldValues } from 'src/engine/permissions/internal/access-group/types/access-group.type';

export const computeAccessGroupHash = ({
  roleId,
  objectMetadataId,
  hasRowLevelRule,
  rowLevelPermissionPredicateGroupId,
  memberFieldValues,
}: {
  roleId: string;
  objectMetadataId: string;
  hasRowLevelRule: boolean;
  rowLevelPermissionPredicateGroupId: string | null;
  memberFieldValues: AccessGroupMemberFieldValues | null;
}): string =>
  createHash('sha256')
    .update(
      JSON.stringify([
        roleId,
        objectMetadataId,
        hasRowLevelRule,
        rowLevelPermissionPredicateGroupId,
        Object.entries(memberFieldValues ?? {}).sort(
          ([firstKey], [secondKey]) => firstKey.localeCompare(secondKey),
        ),
      ]),
    )
    .digest('hex');
