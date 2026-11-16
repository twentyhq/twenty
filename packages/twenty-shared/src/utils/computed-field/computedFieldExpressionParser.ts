import { Parser } from 'expr-eval-fork';

import { EXPRESSION_PARSER_DISABLED_MATH_OPERATORS } from '@/constants/ExpressionParserDisabledMathOperators';

import { COMPUTED_FIELD_EXPRESSION_FUNCTION_NAMES } from '@/constants/ComputedFieldExpressionFunctionNames';

// Only parses: a computed field expression is compiled to SQL and evaluated by the database
export const computedFieldExpressionParser = new Parser({
  allowMemberAccess: true,
  operators: {
    add: true,
    subtract: true,
    multiply: true,
    divide: true,
    remainder: true,
    comparison: true,
    concatenate: true,
    conditional: true,
    logical: true,
    in: true,
    // Built in as one-argument operators; registered as functions instead so round takes a precision
    abs: false,
    ceil: false,
    floor: false,
    round: false,
    trunc: false,
    length: false,
    ...EXPRESSION_PARSER_DISABLED_MATH_OPERATORS,
  },
});

computedFieldExpressionParser.consts = { true: true, false: false };

// Registered so the parser tells function names apart from field references
computedFieldExpressionParser.functions = Object.fromEntries(
  COMPUTED_FIELD_EXPRESSION_FUNCTION_NAMES.map((functionName) => [
    functionName,
    () => undefined,
  ]),
);
