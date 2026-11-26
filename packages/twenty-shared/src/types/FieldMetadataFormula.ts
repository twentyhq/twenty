import { type FieldMetadataFormulaEvaluation } from './FieldMetadataFormulaEvaluation';
import { type ValidationRuleBindings } from './ValidationRuleBindings';

// The universal settings mapping walks every object type, which a recursive tree would blow up: read trees with getFieldMetadataFormulaTree
type StoredExpressionTree = object;

export type FieldMetadataFormula = {
  expression: string;
  // Only for currency fields, where `expression` is the amount in micros
  currencyCodeExpression?: string;
  bindings?: ValidationRuleBindings;
  // TODO(@FelixMalfait): read formulas from the trees and drop the expression and bindings in 2.65
  tree?: StoredExpressionTree;
  currencyCodeTree?: StoredExpressionTree;
  evaluation?: FieldMetadataFormulaEvaluation;
};
