import { type EXPRESSION_SYMBOL_BY_UNARY_OPERATOR } from '@/expression/constants/ExpressionSymbolByUnaryOperator';

export type ExpressionUnaryOperator =
  keyof typeof EXPRESSION_SYMBOL_BY_UNARY_OPERATOR;
