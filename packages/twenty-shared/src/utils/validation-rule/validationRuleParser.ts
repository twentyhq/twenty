import { isString } from '@sniptt/guards';
import { Parser } from 'expr-eval-fork';

import { EXPRESSION_PARSER_DISABLED_MATH_OPERATORS } from '@/constants/ExpressionParserDisabledMathOperators';

import { VALIDATION_RULE_FUNCTIONS } from '@/constants/ValidationRuleFunctions';
import { isDateWithoutTime } from '@/utils/date/isDateWithoutTime';
import { computeExpressionDateDifference } from '@/utils/expression-date/computeExpressionDateDifference';
import { parseToPlainDateOrThrow } from '@/utils/date/parseToPlainDateOrThrow';
import { getValidationRuleNowInUtc } from '@/utils/validation-rule/internal/getValidationRuleNowInUtc';
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
    ...EXPRESSION_PARSER_DISABLED_MATH_OPERATORS,
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

// A date compared with a date and time compares UTC days, as computed fields do
const areEqual = (left: unknown, right: unknown) =>
  isString(left) && isString(right)
    ? getComparableValue({ value: left, otherValue: right }) ===
      getComparableValue({ value: right, otherValue: left })
    : left === right;

validationRuleParser.binaryOps['=='] = areEqual;
validationRuleParser.binaryOps['!='] = (left: unknown, right: unknown) =>
  !areEqual(left, right);
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

validationRuleParser.functions = Object.fromEntries(
  Object.entries(VALIDATION_RULE_FUNCTIONS).map(([name, { evaluate }]) => [
    name,
    evaluate,
  ]),
);

// Deprecated and left out of VALIDATION_RULE_FUNCTIONS, so editors and the SDK never offer it: rules saved before dateDiff keep evaluating
validationRuleParser.functions.daysSince = (date: unknown) =>
  computeExpressionDateDifference(
    date,
    getValidationRuleNowInUtc().toInstant().toString(),
    'DAY',
  );
