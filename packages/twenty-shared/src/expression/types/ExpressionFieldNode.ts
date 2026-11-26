// A record field, on the record or through one relation, kept by identifier so a rename needs no rewrite
export interface ExpressionFieldNode {
  type: 'FIELD';
  fieldUniversalIdentifier: string;
  relationFieldUniversalIdentifier?: string;
  subFieldName?: string;
  isPreviousValue?: boolean;
}
