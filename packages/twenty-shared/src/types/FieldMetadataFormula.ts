import { type FieldMetadataFormulaEvaluation } from './FieldMetadataFormulaEvaluation';
import { type ValidationRuleBindings } from './ValidationRuleBindings';

export type FieldMetadataFormula = {
  expression: string;
  // Only for currency fields, where `expression` is the amount in micros
  currencyCodeExpression?: string;
  bindings?: ValidationRuleBindings;
  evaluation?: FieldMetadataFormulaEvaluation;
};
