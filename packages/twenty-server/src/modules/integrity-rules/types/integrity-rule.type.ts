export type IntegrityRuleCategory =
  | 'REQUIRED_FIELDS'
  | 'ALLOWED_VALUES'
  | 'STATUS_TRANSITION';

export type IntegrityRuleCondition = {
  field: string;
  in?: string[];
  notIn?: string[];
};

type IntegrityRuleBase = {
  key: string;
  objectName: string;
  description: string;
  when?: IntegrityRuleCondition[];
};

export type RequiredFieldsIntegrityRule = IntegrityRuleBase & {
  category: 'REQUIRED_FIELDS';
  fields: string[];
};

export type AllowedValuesIntegrityRule = IntegrityRuleBase & {
  category: 'ALLOWED_VALUES';
  constraint: IntegrityRuleCondition;
};

export type StatusTransitionIntegrityRule = IntegrityRuleBase & {
  category: 'STATUS_TRANSITION';
  field: string;
  allowedTransitions: Record<string, string[]>;
};

export type IntegrityRule =
  | RequiredFieldsIntegrityRule
  | AllowedValuesIntegrityRule
  | StatusTransitionIntegrityRule;
