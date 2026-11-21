/* @license Enterprise */

import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroupValueLookup } from 'src/engine/permissions/internal/access-group/types/access-group-value-lookup.type';
import { type AccessGroupValueLookupKey } from 'src/engine/permissions/internal/access-group/types/access-group-value-lookup-key.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { buildRlsRuleShapeByHash } from 'src/engine/permissions/internal/access-group/utils/build-rls-rule-shape-by-hash.util';
import { isRlsPredicateAtRootConjunction } from 'src/engine/permissions/internal/access-group/utils/is-rls-predicate-at-root-conjunction.util';
import { resolveAccessGroupValueLookupKey } from 'src/engine/permissions/internal/access-group/utils/resolve-access-group-value-lookup-key.util';
import { type RlsRuleShape } from 'src/engine/permissions/internal/rls/types/rls-rule-shape.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';

const findLiteralValueLookupKeys = ({
  splitPredicate,
  flatObjectMetadata,
  metadataMaps,
}: {
  splitPredicate: RlsRuleShape['splitPredicate'];
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupValueLookupKey[] | null => {
  if (!isDefined(splitPredicate)) {
    return null;
  }

  const key = resolveAccessGroupValueLookupKey({
    predicate: splitPredicate,
    memberFieldKey: null,
    flatObjectMetadata,
    metadataMaps,
  });

  if (!isDefined(key)) {
    return null;
  }

  return [key];
};

const findMemberValueLookupKey = ({
  predicate,
  memberPredicates,
  predicateGroups,
  flatObjectMetadata,
  metadataMaps,
}: {
  predicate: RowLevelPermissionPredicate;
  memberPredicates: RowLevelPermissionPredicate[];
  predicateGroups: RlsRule['predicateGroups'];
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupValueLookupKey | null => {
  const memberFieldKey = buildMemberFieldKey(predicate);
  const isOnlyPredicateReadingKey =
    memberPredicates.filter(
      (memberPredicate) =>
        buildMemberFieldKey(memberPredicate) === memberFieldKey,
    ).length === 1;

  if (
    predicate.operand !== RowLevelPermissionPredicateOperand.IS ||
    !isOnlyPredicateReadingKey ||
    !isRlsPredicateAtRootConjunction({
      predicate,
      predicateGroups,
    })
  ) {
    return null;
  }

  return resolveAccessGroupValueLookupKey({
    predicate,
    memberFieldKey,
    flatObjectMetadata,
    metadataMaps,
  });
};

const findMemberValueLookupKeys = ({
  rowLevelPermissionRule,
  flatObjectMetadata,
  metadataMaps,
}: {
  rowLevelPermissionRule: RlsRule;
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupValueLookupKey[] | null => {
  const memberPredicates = rowLevelPermissionRule.predicates.filter(
    ({ workspaceMemberFieldMetadataId }) =>
      isDefined(workspaceMemberFieldMetadataId),
  );

  if (memberPredicates.length === 0) {
    return null;
  }

  const keys = memberPredicates.map((predicate) =>
    findMemberValueLookupKey({
      predicate,
      memberPredicates,
      predicateGroups: rowLevelPermissionRule.predicateGroups,
      flatObjectMetadata,
      metadataMaps,
    }),
  );

  if (!keys.every(isDefined)) {
    return null;
  }

  return keys;
};

export const findAccessGroupValueLookups = ({
  flatObjectMetadata,
  metadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupValueLookup[] => {
  const ruleShapeByHash = buildRlsRuleShapeByHash({
    objectMetadataId: flatObjectMetadata.id,
    rolesPermissions: metadataMaps.rolesPermissions,
    isRelationHopEnabled: isRlsRelationHopEnabled(metadataMaps.featureFlagsMap),
  });

  return [...ruleShapeByHash].flatMap(
    ([ruleShapeHash, ruleShape]): AccessGroupValueLookup[] => {
      const { predicates, predicateGroups } = ruleShape.rowLevelPermissionRule;
      const literalValueLookupKeys = findLiteralValueLookupKeys({
        splitPredicate: ruleShape.splitPredicate,
        flatObjectMetadata,
        metadataMaps,
      });

      if (isDefined(literalValueLookupKeys)) {
        return [
          {
            type: 'RLS_LITERAL_VALUE',
            ruleShapeHash,
            keys: literalValueLookupKeys,
            residualRule: {
              predicates: predicates.filter(
                ({ id }) => id !== ruleShape.splitPredicate?.id,
              ),
              predicateGroups,
            },
          },
        ];
      }

      const memberValueLookupKeys = findMemberValueLookupKeys({
        rowLevelPermissionRule: ruleShape.rowLevelPermissionRule,
        flatObjectMetadata,
        metadataMaps,
      });

      if (!isDefined(memberValueLookupKeys)) {
        return [];
      }

      return [
        {
          type: 'RLS_MEMBER_VALUE',
          ruleShapeHash,
          keys: memberValueLookupKeys,
          residualRule: {
            predicates: predicates.filter(
              ({ workspaceMemberFieldMetadataId }) =>
                !isDefined(workspaceMemberFieldMetadataId),
            ),
            predicateGroups,
          },
        },
      ];
    },
  );
};
