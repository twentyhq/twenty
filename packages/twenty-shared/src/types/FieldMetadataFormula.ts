import { type ValidationRuleBindings } from './ValidationRuleBindings';

export type FieldMetadataFormula = {
  expression: string;
  bindings?: ValidationRuleBindings;
};
