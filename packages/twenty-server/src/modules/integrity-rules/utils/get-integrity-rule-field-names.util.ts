import { type IntegrityRule } from 'src/modules/integrity-rules/types/integrity-rule.type';

export const getIntegrityRuleFieldNames = (rule: IntegrityRule): string[] => {
  const conditionFieldNames = (rule.when ?? []).map(({ field }) => field);

  switch (rule.category) {
    case 'REQUIRED_FIELDS':
      return [...conditionFieldNames, ...rule.fields];
    case 'ALLOWED_VALUES':
      return [...conditionFieldNames, rule.constraint.field];
    case 'STATUS_TRANSITION':
      return [...conditionFieldNames, rule.field];
  }
};
