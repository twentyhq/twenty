/* @license Enterprise */

import { createHash } from 'crypto';

import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AccessGroupMemberFieldValues } from 'src/engine/permissions/internal/access-group/types/access-group.type';

const sortByContent = <TEntry>(entries: TEntry[]): string[] =>
  entries.map((entry) => JSON.stringify(entry)).sort();

const buildPredicateGroupContent = ({
  parentPredicateGroupId,
  predicates,
  predicateGroups,
}: {
  parentPredicateGroupId: string | null;
  predicates: RowLevelPermissionPredicate[];
  predicateGroups: RowLevelPermissionPredicateGroup[];
}): { predicates: string[]; predicateGroups: string[] } => ({
  predicates: sortByContent(
    predicates
      .filter(
        ({ rowLevelPermissionPredicateGroupId }) =>
          (rowLevelPermissionPredicateGroupId ?? null) ===
          parentPredicateGroupId,
      )
      .map((predicate) => [
        predicate.fieldMetadataId,
        predicate.subFieldName,
        predicate.operand,
        predicate.value,
        predicate.workspaceMemberFieldMetadataId,
        predicate.workspaceMemberSubFieldName,
      ]),
  ),
  predicateGroups: sortByContent(
    predicateGroups
      .filter(
        ({ parentRowLevelPermissionPredicateGroupId }) =>
          (parentRowLevelPermissionPredicateGroupId ?? null) ===
          parentPredicateGroupId,
      )
      .map((predicateGroup) => [
        predicateGroup.logicalOperator,
        buildPredicateGroupContent({
          parentPredicateGroupId: predicateGroup.id,
          predicates,
          predicateGroups,
        }),
      ]),
  ),
});

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
        isDefined(rowLevelRecordsPermissions)
          ? buildPredicateGroupContent({
              parentPredicateGroupId: null,
              predicates: rowLevelRecordsPermissions.predicates,
              predicateGroups: rowLevelRecordsPermissions.predicateGroups,
            })
          : null,
        rowLevelPermissionPredicateGroupId,
        Object.entries(memberFieldValues ?? {}).sort(
          ([firstKey], [secondKey]) => firstKey.localeCompare(secondKey),
        ),
      ]),
    )
    .digest('hex');
