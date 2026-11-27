import { type FieldMetadataFormulaEvaluation } from './FieldMetadataFormulaEvaluation';
import { type StoredExpressionTree } from './StoredExpressionTree';

export type FieldMetadataFormula = {
  tree?: StoredExpressionTree;
  // Only for currency fields, where `tree` is the amount in micros
  currencyCodeTree?: StoredExpressionTree;
  evaluation?: FieldMetadataFormulaEvaluation;
  // Text a client writes; the server turns it into the trees and never stores it
  expression?: string;
  currencyCodeExpression?: string;
};
