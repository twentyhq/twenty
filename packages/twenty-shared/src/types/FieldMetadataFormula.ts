import { type ValidationRuleBindings } from './ValidationRuleBindings';

export type FieldMetadataFormula = {
  expression: string;
  // Field read by each path of the expression, written by the server when the formula is saved
  bindings?: ValidationRuleBindings;
};
