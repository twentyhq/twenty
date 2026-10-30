import { type IntegrityRuleCategory } from 'src/modules/integrity-rules/types/integrity-rule.type';

export type IntegrityViolation = {
  ruleKey: string;
  category: IntegrityRuleCategory;
  fields: string[];
  message: string;
};
