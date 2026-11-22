// TODO(@neo773): remove once no rule is written as text anymore (stored widget rules are converted in 2.61; built-in rules and app manifests still send text)
import { Parser } from 'expr-eval-fork';

import { CONDITIONAL_AVAILABILITY_FUNCTIONS } from '@/conditional-availability/constants/ConditionalAvailabilityFunctions';

export const conditionalAvailabilityStrictParser = new Parser({
  allowMemberAccess: true,
  operators: {
    comparison: true,
    logical: true,
    subtract: true,
    add: false,
    multiply: false,
    divide: false,
    remainder: false,
    power: false,
    factorial: false,
    concatenate: false,
    conditional: false,
    in: false,
    length: false,
    assignment: false,
    fndef: false,
    array: false,
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
    abs: false,
    ceil: false,
    floor: false,
    round: false,
    trunc: false,
    exp: false,
    sign: false,
  },
});

conditionalAvailabilityStrictParser.consts = { true: true, false: false };

conditionalAvailabilityStrictParser.functions = {
  ...CONDITIONAL_AVAILABILITY_FUNCTIONS,
};
