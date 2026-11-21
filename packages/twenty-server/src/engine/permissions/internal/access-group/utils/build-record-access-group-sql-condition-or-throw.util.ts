/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type AccessGroupSplitValue } from 'src/engine/permissions/internal/access-group/types/access-group-split-value.type';
import { buildRlsRuleSQLCondition } from 'src/engine/permissions/internal/access-group/utils/build-rls-rule-sql-condition.util';
import { type RlsRuleShape } from 'src/engine/permissions/internal/rls/types/rls-rule-shape.type';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

const MATCHING_NO_RECORD: SQLCondition = { sql: 'FALSE', parameters: {} };

const buildGroupRule = ({
  accessGroup,
  ruleShape,
}: {
  accessGroup: Pick<AccessGroup, 'ruleShapeHash'> & AccessGroupSplitValue;
  ruleShape: RlsRuleShape;
}): RlsRule => {
  if (accessGroup.type !== 'RLS_LITERAL_VALUE') {
    return ruleShape.rowLevelPermissionRule;
  }

  return {
    ...ruleShape.rowLevelPermissionRule,
    predicates: ruleShape.rowLevelPermissionRule.predicates.map((predicate) =>
      predicate.id === ruleShape.splitPredicate?.id
        ? { ...predicate, value: [accessGroup.value] }
        : predicate,
    ),
  };
};

// null when the group reaches every record of the object
export const buildRecordAccessGroupSQLConditionOrThrow = ({
  accessGroup,
  ruleShapeByHash,
  flatObjectMetadata,
  tableAlias,
  metadataMaps,
}: {
  accessGroup: Pick<AccessGroup, 'ruleShapeHash'> & AccessGroupSplitValue;
  ruleShapeByHash: Map<string, RlsRuleShape>;
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): SQLCondition | null => {
  if (accessGroup.type === 'ALL_RECORDS') {
    return null;
  }

  const ruleShape = ruleShapeByHash.get(accessGroup.ruleShapeHash);

  if (!isDefined(ruleShape)) {
    return MATCHING_NO_RECORD;
  }

  return buildRlsRuleSQLCondition({
    rowLevelPermissionRule: buildGroupRule({ accessGroup, ruleShape }),
    memberFieldValues:
      accessGroup.type === 'RLS_MEMBER_VALUE'
        ? accessGroup.memberFieldValues
        : {},
    flatObjectMetadata,
    tableAlias,
    metadataMaps,
  });
};
