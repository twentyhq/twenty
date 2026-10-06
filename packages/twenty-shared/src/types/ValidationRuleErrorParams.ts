// The values a translated error message puts back in, such as the field the expression names
export type ValidationRuleErrorParams = {
  fieldName?: string;
  maxLength?: number;
  path?: string;
  relationFieldName?: string;
  subfieldName?: string;
};
