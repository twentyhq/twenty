/* @license Enterprise */

import { createHash } from 'crypto';

import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';

const sortByContent = <TEntry>(entries: TEntry[]): string[] =>
  entries.map((entry) => JSON.stringify(entry)).sort();

const serializeRowLevelPermissionPredicateGroup = ({
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
        serializeRowLevelPermissionPredicateGroup({
          parentPredicateGroupId: predicateGroup.id,
          predicates,
          predicateGroups,
          isRelationHopEnabled,
        }),
      ]),
  ),
});

const serializeRowLevelPermissionRule = ({
  rowLevelPermissionRule,
  splitPredicateId,
  isRelationHopEnabled,
}: {
  rowLevelPermissionRule: RlsRule | null;
  splitPredicateId: string | null;
  isRelationHopEnabled: boolean;
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
    isRelationHopEnabled,
  });
};

export const computeRuleShapeHash = ({
  objectMetadataId,
  rowLevelPermissionRule,
  splitPredicateId,
  unreadableFieldIds,
  isRelationHopEnabled,
}: {
  objectMetadataId: string;
  rowLevelPermissionRule: RlsRule | null;
  splitPredicateId: string | null;
  unreadableFieldIds: string[];
  isRelationHopEnabled: boolean;
}): string =>
  createHash('sha256')
    .update(
      JSON.stringify([
        objectMetadataId,
        serializeRowLevelPermissionRule({
          rowLevelPermissionRule,
          splitPredicateId,
          isRelationHopEnabled,
        }),
        [...unreadableFieldIds].sort(),
      ]),
    )
    .digest('hex');
