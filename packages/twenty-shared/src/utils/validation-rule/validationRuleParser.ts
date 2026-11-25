import { isString } from '@sniptt/guards';
import { Parser } from 'expr-eval-fork';

import { FORMULA_AGGREGATE_FUNCTION_NAMES } from '@/constants/FormulaAggregateFunctionNames';
import { VALIDATION_RULE_FUNCTIONS } from '@/constants/ValidationRuleFunctions';
import { isDateWithoutTime } from '@/utils/date/isDateWithoutTime';
import { parseToPlainDateOrThrow } from '@/utils/date/parseToPlainDateOrThrow';
import { parseExpressionDate } from '@/utils/expression-date/parseExpressionDate';
import { isDefined } from '@/utils/validation/isDefined';
import { isValidationRuleValueDefined } from '@/utils/validation-rule/isValidationRuleValueDefined';

// An operator enabled here for apps also needs a helper in twenty-sdk's ruleExpression
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
    conditional: false,
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

const toPlainDateStringOrSelf = (value: string): string => {
  try {
    return parseToPlainDateOrThrow(value).toString();
  } catch {
    return value;
  }
};

const getComparableValue = ({
  value,
  otherValue,
}: {
  value: NonNullable<unknown>;
  otherValue: NonNullable<unknown>;
}): NonNullable<unknown> => {
  if (
    isString(value) &&
    isString(otherValue) &&
    isDateWithoutTime(otherValue)
  ) {
    return toPlainDateStringOrSelf(value);
  }

  if (isString(value) && isString(otherValue)) {
    const date = parseExpressionDate(value);
    const otherDate = parseExpressionDate(otherValue);

    if (
      isDefined(date) &&
      isDefined(otherDate) &&
      !date.isDateOnly &&
      !otherDate.isDateOnly
    ) {
      return date.dateTime.epochNanoseconds;
    }
  }

  return value;
};

const compareDefinedValues =
  (
    compare: (
      left: NonNullable<unknown>,
      right: NonNullable<unknown>,
    ) => boolean,
  ) =>
  (left: unknown, right: unknown) =>
    isValidationRuleValueDefined(left) &&
    isValidationRuleValueDefined(right) &&
    compare(
      getComparableValue({ value: left, otherValue: right }),
      getComparableValue({ value: right, otherValue: left }),
    );

const areEqual = ({ left, right }: { left: unknown; right: unknown }) =>
  isString(left) && isString(right)
    ? getComparableValue({ value: left, otherValue: right }) ===
      getComparableValue({ value: right, otherValue: left })
    : left === right;

validationRuleParser.binaryOps['=='] = (left: unknown, right: unknown) =>
  areEqual({ left, right });
validationRuleParser.binaryOps['!='] = (left: unknown, right: unknown) =>
  !areEqual({ left, right });
validationRuleParser.binaryOps['<'] = compareDefinedValues(
  (left, right) => left < right,
);
validationRuleParser.binaryOps['<='] = compareDefinedValues(
  (left, right) => left <= right,
);
validationRuleParser.binaryOps['>'] = compareDefinedValues(
  (left, right) => left > right,
);
validationRuleParser.binaryOps['>='] = compareDefinedValues(
  (left, right) => left >= right,
);
validationRuleParser.binaryOps.in = (value: unknown, list: unknown) =>
  Array.isArray(list) && list.includes(value);

const toConcatenableValue = (value: unknown) =>
  isValidationRuleValueDefined(value) ? value : '';

validationRuleParser.binaryOps['||'] = (left: unknown, right: unknown) =>
  Array.isArray(left) && Array.isArray(right)
    ? [...left, ...right]
    : `${toConcatenableValue(left)}${toConcatenableValue(right)}`;

// Counts code points and treats null as empty, as the SQL formula compiler does
validationRuleParser.unaryOps.length = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.length;
  }

  return isValidationRuleValueDefined(value) ? [...String(value)].length : 0;
};

// An aggregate has no value on a single record: the server computes it from the related records
const evaluateAggregate = () => null;

validationRuleParser.functions = {
  ...Object.fromEntries(
    FORMULA_AGGREGATE_FUNCTION_NAMES.map((name) => [name, evaluateAggregate]),
  ),
  ...Object.fromEntries(
    Object.entries(VALIDATION_RULE_FUNCTIONS).map(([name, { evaluate }]) => [
      name,
      evaluate,
    ]),
  ),
};
