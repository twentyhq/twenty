/* @license Enterprise */

import { createHash } from 'crypto';

import { type RowLevelRecordsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AccessGroupMemberFieldValues } from 'src/engine/permissions/internal/access-group/types/access-group.type';

const sortByContent = (entries: unknown[]): string[] =>
  entries.map((entry) => JSON.stringify(entry)).sort();

const buildRowLevelRuleContent = (
  rowLevelRecordsPermissions: RowLevelRecordsPermissions | null | undefined,
) =>
  isDefined(rowLevelRecordsPermissions)
    ? {
        predicates: sortByContent(
          rowLevelRecordsPermissions.predicates.map((predicate) => [
            predicate.rowLevelPermissionPredicateGroupId,
            predicate.fieldMetadataId,
            predicate.subFieldName,
            predicate.operand,
            predicate.value,
            predicate.workspaceMemberFieldMetadataId,
            predicate.workspaceMemberSubFieldName,
          ]),
        ),
        predicateGroups: sortByContent(
          rowLevelRecordsPermissions.predicateGroups.map((predicateGroup) => [
            predicateGroup.id,
            predicateGroup.parentRowLevelPermissionPredicateGroupId,
            predicateGroup.logicalOperator,
          ]),
        ),
      }
    : null;

export const computeAccessGroupHash = ({
  roleId,
  objectMetadataId,
  rowLevelRecordsPermissions,
  rowLevelPermissionPredicateGroupId,
  memberFieldValues,
}: {
  roleId: string;
  objectMetadataId: string;
  rowLevelRecordsPermissions: RowLevelRecordsPermissions | null | undefined;
  rowLevelPermissionPredicateGroupId: string | null;
  memberFieldValues: AccessGroupMemberFieldValues | null;
}): string =>
  createHash('sha256')
    .update(
      JSON.stringify([
        roleId,
        objectMetadataId,
        buildRowLevelRuleContent(rowLevelRecordsPermissions),
        rowLevelPermissionPredicateGroupId,
        Object.entries(memberFieldValues ?? {}).sort(
          ([firstKey], [secondKey]) => firstKey.localeCompare(secondKey),
        ),
      ]),
    )
    .digest('hex');
