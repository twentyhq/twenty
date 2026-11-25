import { type EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR } from '@/constants/ExpressionSymbolByArithmeticOperator';

export type ExpressionArithmeticOperator =
  keyof typeof EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR;
