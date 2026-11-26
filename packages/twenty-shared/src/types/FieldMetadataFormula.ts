import { type FieldMetadataFormulaEvaluation } from './FieldMetadataFormulaEvaluation';

// The universal flat entity mapping walks every object type, which a recursive tree would blow up: read trees with getFieldMetadataFormulaTree
type StoredExpressionTree = object;

export type FieldMetadataFormula = {
  tree?: StoredExpressionTree;
  // Only for currency fields, where `tree` is the amount in micros
  currencyCodeTree?: StoredExpressionTree;
  evaluation?: FieldMetadataFormulaEvaluation;
  // Text a client writes; the server turns it into the trees and never stores it
  expression?: string;
  currencyCodeExpression?: string;
};
