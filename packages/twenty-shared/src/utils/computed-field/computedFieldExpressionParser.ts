import { Parser } from 'expr-eval-fork';

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
    power: false,
    factorial: false,
    assignment: false,
    fndef: false,
    random: false,
    min: false,
    max: false,
    sin: false,
    cos: false,
    tan: false,
    asin: false,
    acos: false,
    atan: false,
    sinh: false,
    cosh: false,
    tanh: false,
    asinh: false,
    acosh: false,
    atanh: false,
    sqrt: false,
    cbrt: false,
    log: false,
    log2: false,
    ln: false,
    lg: false,
    log10: false,
    expm1: false,
    log1p: false,
    exp: false,
    sign: false,
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
