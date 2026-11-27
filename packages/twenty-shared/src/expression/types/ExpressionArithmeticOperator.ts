import { type EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR } from '@/expression/constants/ExpressionSymbolByArithmeticOperator';

export type ExpressionArithmeticOperator =
  keyof typeof EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR;
