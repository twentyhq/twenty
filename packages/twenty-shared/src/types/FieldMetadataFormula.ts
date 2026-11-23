import { type ValidationRuleBindings } from './ValidationRuleBindings';

export type FieldMetadataFormula = {
  expression: string;
  // Only for currency fields, where `expression` is the amount in micros
  currencyCodeExpression?: string;
  // Field read by each path of the expressions, written by the server when the formula is saved
  bindings?: ValidationRuleBindings;
};
