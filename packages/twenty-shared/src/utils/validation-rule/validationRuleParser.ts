import { isNonEmptyString } from '@sniptt/guards';
import { Parser } from 'expr-eval-fork';

import { VALIDATION_RULE_AGGREGATE_FUNCTIONS } from '@/constants/ValidationRuleAggregateFunctions';
import { isValidationRuleAggregateFunctionName } from '@/utils/validation-rule/isValidationRuleAggregateFunctionName';
import { isValidationRuleValueDefined } from '@/utils/validation-rule/isValidationRuleValueDefined';
import { isValidationRuleValueEmpty } from '@/utils/validation-rule/isValidationRuleValueEmpty';
import { readValidationRuleAggregateValue } from '@/utils/validation-rule/readValidationRuleAggregateValue';

export const validationRuleParser = new Parser({
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
    length: true,
    abs: true,
    ceil: true,
    floor: true,
    round: true,
    trunc: true,
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

validationRuleParser.consts = { true: true, false: false };

const compareDefinedValues =
  (compare: (left: unknown, right: unknown) => boolean) =>
  (left: unknown, right: unknown) =>
    isValidationRuleValueDefined(left) &&
    isValidationRuleValueDefined(right) &&
    compare(left, right);

validationRuleParser.binaryOps['<'] = compareDefinedValues(
  (left, right) => (left as number) < (right as number),
);
validationRuleParser.binaryOps['<='] = compareDefinedValues(
  (left, right) => (left as number) <= (right as number),
);
validationRuleParser.binaryOps['>'] = compareDefinedValues(
  (left, right) => (left as number) > (right as number),
);
validationRuleParser.binaryOps['>='] = compareDefinedValues(
  (left, right) => (left as number) >= (right as number),
);

validationRuleParser.functions = {
  isDefined: isValidationRuleValueDefined,
  isEmpty: isValidationRuleValueEmpty,
  isNonEmptyString: (value: unknown) => isNonEmptyString(value),
  includes: (array: unknown, value: unknown) =>
    Array.isArray(array) && array.includes(value),
  arrayLength: (value: unknown) => (Array.isArray(value) ? value.length : 0),
  ...Object.fromEntries(
    Object.keys(VALIDATION_RULE_AGGREGATE_FUNCTIONS)
      .filter(isValidationRuleAggregateFunctionName)
      .map((functionName) => [
        functionName,
        (aggregateValues: unknown) =>
          readValidationRuleAggregateValue(aggregateValues, functionName),
      ]),
  ),
};
