/* @license Enterprise */

import {
  type RowLevelPermissionPredicate,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeRuleShapeHash } from 'src/engine/permissions/internal/access-group/utils/compute-rule-shape-hash.util';
import { findLiteralValuePredicate } from 'src/engine/permissions/internal/access-group/utils/find-literal-value-predicate.util';

// the builder and the computation resolve a rule the same way, so a group always finds its rule back
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
  literalValuePredicate:
    | (RowLevelPermissionPredicate & { value: string[] })
    | null;
} => {
  const literalValuePredicate = isDefined(rowLevelPermissionRule)
    ? findLiteralValuePredicate(rowLevelPermissionRule)
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
      literalValuePredicateId: literalValuePredicate?.id ?? null,
      unreadableFieldIds,
      isRelationHopEnabled,
    }),
    unreadableFieldIds,
    literalValuePredicate,
  };
};
