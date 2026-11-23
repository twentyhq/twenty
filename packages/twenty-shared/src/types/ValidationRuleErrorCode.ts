import { type ExpressionSyntaxErrorCode } from './ExpressionSyntaxErrorCode';

export type ValidationRuleErrorCode =
  | ExpressionSyntaxErrorCode
  | 'EMPTY_EXPRESSION'
  | 'EXPRESSION_TOO_LONG'
  | 'BRACKET_ACCESS'
  | 'SPACED_MEMBER_DOT'
  | 'NOT_A_VALUE'
  | 'UNKNOWN_FIELD'
  | 'UNKNOWN_SUBFIELD'
  | 'SUBFIELD_TOO_DEEP'
  | 'NOT_A_TO_ONE_RELATION'
  | 'UNKNOWN_RELATION_TARGET_FIELD'
  | 'RELATION_TOO_DEEP'
  | 'PREVIOUS_VALUE_OF_RELATION'
  | 'NON_BOOLEAN_RESULT'
  | 'INVALID_DATE_UNIT'
  | 'INVALID_DATE_PART';
