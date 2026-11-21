/* @license Enterprise */

import { createHash } from 'crypto';

import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';

const sortByContent = <TEntry>(entries: TEntry[]): string[] =>
  entries.map((entry) => JSON.stringify(entry)).sort();

const buildPredicateGroupContent = ({
  parentPredicateGroupId,
  predicates,
  predicateGroups,
  isRelationHopEnabled,
}: {
  parentPredicateGroupId: string | null;
  predicates: RowLevelPermissionPredicate[];
  predicateGroups: RowLevelPermissionPredicateGroup[];
  isRelationHopEnabled: boolean;
}): { predicates: string[]; predicateGroups: string[] } => ({
  predicates: sortByContent(
    predicates
      .filter(
        ({ rowLevelPermissionPredicateGroupId }) =>
          (rowLevelPermissionPredicateGroupId ?? null) ===
          parentPredicateGroupId,
      )
      .map((predicate) => [
        ...(isDefined(predicate.relationFieldMetadataId)
          ? [predicate.relationFieldMetadataId, isRelationHopEnabled]
          : []),
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
          isRelationHopEnabled,
        }),
      ]),
  ),
});

export const computeAccessGroupHash = ({
  roleId,
  objectMetadataId,
  rowLevelPermissionRule,
  rowLevelPermissionPredicateGroupId,
  memberFieldValues,
  isRelationHopEnabled,
}: {
  roleId: string;
  objectMetadataId: string;
  rowLevelPermissionRule: Pick<
    RowLevelRecordsPermissions,
    'predicates' | 'predicateGroups'
  > | null;
  rowLevelPermissionPredicateGroupId: string | null;
  memberFieldValues: RlsMemberFieldValues | null;
  isRelationHopEnabled: boolean;
}): string =>
  createHash('sha256')
    .update(
      JSON.stringify([
        roleId,
        objectMetadataId,
        isDefined(rowLevelPermissionRule)
          ? buildPredicateGroupContent({
              parentPredicateGroupId: null,
              predicates: rowLevelPermissionRule.predicates,
              predicateGroups: rowLevelPermissionRule.predicateGroups,
              isRelationHopEnabled,
            })
          : null,
        rowLevelPermissionPredicateGroupId,
        Object.entries(memberFieldValues ?? {}).sort(
          ([firstKey], [secondKey]) => firstKey.localeCompare(secondKey),
        ),
      ]),
    )
    .digest('hex');
