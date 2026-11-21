/* @license Enterprise */

import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { buildRlsRuleShapeByHash } from 'src/engine/permissions/internal/access-group/utils/build-rls-rule-shape-by-hash.util';
import { type AccessGroupValueLookup } from 'src/engine/permissions/internal/access-group/value-lookup/types/access-group-value-lookup.type';
import { type AccessGroupValueLookupKey } from 'src/engine/permissions/internal/access-group/value-lookup/types/access-group-value-lookup-key.type';
import { resolveAccessGroupValueLookupKey } from 'src/engine/permissions/internal/access-group/value-lookup/utils/resolve-access-group-value-lookup-key.util';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { isRlsPredicateAtRootConjunction } from 'src/engine/permissions/internal/rls/utils/is-rls-predicate-at-root-conjunction.util';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';

const findMemberValueLookupKeys = ({
  rowLevelPermissionRule: { predicates, predicateGroups },
  metadataMaps,
}: {
  rowLevelPermissionRule: RlsRule;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupValueLookupKey[] | null => {
  const memberPredicates = predicates.filter(
    ({ workspaceMemberFieldMetadataId }) =>
      isDefined(workspaceMemberFieldMetadataId),
  );
  const memberFieldKeys = memberPredicates.map(buildMemberFieldKey);
  const isEligible = (predicate: RowLevelPermissionPredicate): boolean =>
    predicate.operand === RowLevelPermissionPredicateOperand.IS &&
    memberFieldKeys.filter((key) => key === buildMemberFieldKey(predicate))
      .length === 1 &&
    isRlsPredicateAtRootConjunction({ predicate, predicateGroups });

  if (memberPredicates.length === 0 || !memberPredicates.every(isEligible)) {
    return null;
  }

  const keys = memberPredicates.map((predicate) =>
    resolveAccessGroupValueLookupKey({ predicate, metadataMaps }),
  );

  return keys.every(isDefined) ? keys : null;
};

export const findAccessGroupValueLookups = ({
  flatObjectMetadata,
  metadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupValueLookup[] =>
  [
    ...buildRlsRuleShapeByHash({
      objectMetadataId: flatObjectMetadata.id,
      rolesPermissions: metadataMaps.rolesPermissions,
      isRelationHopEnabled: isRlsRelationHopEnabled(
        metadataMaps.featureFlagsMap,
      ),
    }),
  ].flatMap(
    ([
      ruleShapeHash,
      { rowLevelPermissionRule, splitPredicate },
    ]): AccessGroupValueLookup[] => {
      const { predicates, predicateGroups } = rowLevelPermissionRule;
      const literalValueLookupKey = isDefined(splitPredicate)
        ? resolveAccessGroupValueLookupKey({
            predicate: splitPredicate,
            metadataMaps,
          })
        : null;

      if (isDefined(literalValueLookupKey)) {
        return [
          {
            type: 'RLS_LITERAL_VALUE',
            ruleShapeHash,
            keys: [literalValueLookupKey],
            residualRule: {
              predicates: predicates.filter(
                ({ id }) => id !== splitPredicate?.id,
              ),
              predicateGroups,
            },
          },
        ];
      }

      const memberValueLookupKeys = findMemberValueLookupKeys({
        rowLevelPermissionRule,
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
