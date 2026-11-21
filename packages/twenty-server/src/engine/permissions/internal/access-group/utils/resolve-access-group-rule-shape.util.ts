/* @license Enterprise */

import {
  type RowLevelPermissionPredicate,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeRuleShapeHash } from 'src/engine/permissions/internal/access-group/utils/compute-rule-shape-hash.util';
import { findRlsRuleLiteralValuesPredicate } from 'src/engine/permissions/internal/access-group/utils/find-rls-rule-literal-values-predicate.util';

export const resolveAccessGroupRuleShape = ({
  objectMetadataId,
  objectUnreadableFieldIds,
  rowLevelPermissionRule,
  isRelationHopEnabled,
}: {
  objectMetadataId: string;
  objectUnreadableFieldIds: string[];
  rowLevelPermissionRule: Pick<
    RowLevelRecordsPermissions,
    'predicates' | 'predicateGroups' | 'unreadableFields'
  > | null;
  isRelationHopEnabled: boolean;
}): {
  ruleShapeHash: string;
  unreadableFieldIds: string[];
  splitPredicate: (RowLevelPermissionPredicate & { value: string[] }) | null;
} => {
  const splitPredicate = isDefined(rowLevelPermissionRule)
    ? findRlsRuleLiteralValuesPredicate(rowLevelPermissionRule)
    : null;
  const unreadableFieldIds = [
    ...new Set([
      ...objectUnreadableFieldIds,
      ...(rowLevelPermissionRule?.unreadableFields ?? []),
    ]),
  ].sort();

  return {
    ruleShapeHash: computeRuleShapeHash({
      objectMetadataId,
      rowLevelPermissionRule,
      splitPredicateId: splitPredicate?.id ?? null,
      unreadableFieldIds,
      isRelationHopEnabled,
    }),
    unreadableFieldIds,
    splitPredicate,
  };
};
