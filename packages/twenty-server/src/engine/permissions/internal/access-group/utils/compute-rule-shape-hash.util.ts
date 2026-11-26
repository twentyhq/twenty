/* @license Enterprise */

import { createHash } from 'crypto';

import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RELATION_PREDICATE_SHAPE_HASH_MARKER } from 'src/engine/permissions/internal/access-group/constants/relation-predicate-shape-hash-marker.constant';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';

const sortByContent = <TEntry>(entries: TEntry[]): string[] =>
  entries.map((entry) => JSON.stringify(entry)).sort();

const serializeWorkspaceMemberRelation = ({
  workspaceMemberRelationFieldMetadataId,
  workspaceMemberRelationFilterFieldMetadataId,
  workspaceMemberRelationFilterValues,
}: Pick<
  RowLevelPermissionPredicate,
  | 'workspaceMemberRelationFieldMetadataId'
  | 'workspaceMemberRelationFilterFieldMetadataId'
  | 'workspaceMemberRelationFilterValues'
>): string[] => {
  if (!isDefined(workspaceMemberRelationFieldMetadataId)) {
    return [];
  }

  if (!isDefined(workspaceMemberRelationFilterFieldMetadataId)) {
    return [workspaceMemberRelationFieldMetadataId];
  }

  return [
    workspaceMemberRelationFieldMetadataId,
    workspaceMemberRelationFilterFieldMetadataId,
    JSON.stringify([...(workspaceMemberRelationFilterValues ?? [])].sort()),
  ];
};

const serializeRowLevelPermissionPredicateGroup = ({
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
        ...(isDefined(predicate.relationFieldMetadataId)
          ? [
              predicate.relationFieldMetadataId,
              RELATION_PREDICATE_SHAPE_HASH_MARKER,
            ]
          : []),
        predicate.fieldMetadataId,
        predicate.subFieldName,
        predicate.operand,
        predicate.value,
        predicate.workspaceMemberFieldMetadataId,
        predicate.workspaceMemberSubFieldName,
        ...serializeWorkspaceMemberRelation(predicate),
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
        serializeRowLevelPermissionPredicateGroup({
          parentPredicateGroupId: predicateGroup.id,
          predicates,
          predicateGroups,
        }),
      ]),
  ),
});

const serializeRowLevelPermissionRule = ({
  rowLevelPermissionRule,
  splitPredicateId,
}: {
  rowLevelPermissionRule: RlsRule | null;
  splitPredicateId: string | null;
}): { predicates: string[]; predicateGroups: string[] } | null => {
  if (!isDefined(rowLevelPermissionRule)) {
    return null;
  }

  const predicatesWithoutLiteralValue = rowLevelPermissionRule.predicates.map(
    (predicate) => {
      if (predicate.id !== splitPredicateId) {
        return predicate;
      }

      return { ...predicate, value: null };
    },
  );

  return serializeRowLevelPermissionPredicateGroup({
    parentPredicateGroupId: null,
    predicates: predicatesWithoutLiteralValue,
    predicateGroups: rowLevelPermissionRule.predicateGroups,
  });
};

export const computeRuleShapeHash = ({
  objectMetadataId,
  rowLevelPermissionRule,
  splitPredicateId,
  unreadableFieldIds,
}: {
  objectMetadataId: string;
  rowLevelPermissionRule: RlsRule | null;
  splitPredicateId: string | null;
  unreadableFieldIds: string[];
}): string =>
  createHash('sha256')
    .update(
      JSON.stringify([
        objectMetadataId,
        serializeRowLevelPermissionRule({
          rowLevelPermissionRule,
          splitPredicateId,
        }),
        [...unreadableFieldIds].sort(),
      ]),
    )
    .digest('hex');
