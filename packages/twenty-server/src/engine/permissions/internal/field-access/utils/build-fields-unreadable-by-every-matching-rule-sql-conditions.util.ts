import { isNonEmptyArray } from 'twenty-shared/utils';

import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

type RlsRuleFieldsSQLCondition = {
  fieldMetadataIds: string[];
  sqlCondition: SQLCondition;
};

const combineWithOr = (sqlConditions: SQLCondition[]): SQLCondition =>
  sqlConditions.length === 1
    ? sqlConditions[0]
    : combineSQLConditions({ sqlConditions, operator: 'OR' });

export const buildFieldsUnreadableByEveryMatchingRuleSQLConditions = (
  rlsRuleSQLConditions: RlsRuleFieldsSQLCondition[],
): RlsRuleFieldsSQLCondition[] => {
  const fieldMetadataIds = [
    ...new Set(
      rlsRuleSQLConditions.flatMap(
        ({ fieldMetadataIds: ruleFieldMetadataIds }) => ruleFieldMetadataIds,
      ),
    ),
  ];

  return fieldMetadataIds.map((fieldMetadataId) => {
    const isRuleHidingField = ({
      fieldMetadataIds: ruleFieldMetadataIds,
    }: RlsRuleFieldsSQLCondition) =>
      ruleFieldMetadataIds.includes(fieldMetadataId);
    const hidingSQLCondition = combineWithOr(
      rlsRuleSQLConditions
        .filter(isRuleHidingField)
        .map(({ sqlCondition }) => sqlCondition),
    );
    const showingSQLConditions = rlsRuleSQLConditions
      .filter((rlsRuleSQLCondition) => !isRuleHidingField(rlsRuleSQLCondition))
      .map(({ sqlCondition }) => sqlCondition);

    if (!isNonEmptyArray(showingSQLConditions)) {
      return {
        fieldMetadataIds: [fieldMetadataId],
        sqlCondition: hidingSQLCondition,
      };
    }

    const showingSQLCondition = combineWithOr(showingSQLConditions);

    return {
      fieldMetadataIds: [fieldMetadataId],
      sqlCondition: {
        sql: `(${hidingSQLCondition.sql}) AND (${showingSQLCondition.sql}) IS NOT TRUE`,
        parameters: {
          ...hidingSQLCondition.parameters,
          ...showingSQLCondition.parameters,
        },
      },
    };
  });
};
