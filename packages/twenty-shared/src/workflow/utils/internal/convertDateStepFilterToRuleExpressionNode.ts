import { Temporal } from 'temporal-polyfill';

import { FirstDayOfTheWeek } from '@/types/FirstDayOfTheWeek';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { parseToInstantOrThrow } from '@/utils/date/parseToInstantOrThrow';
import { safeParseRelativeDateFilterJsonStringified } from '@/utils/safeParseRelativeDateFilterJsonStringified';
import { isDefined } from '@/utils/validation/isDefined';
import { type RuleExpressionNode } from '@/workflow/utils/internal/RuleExpressionNode';
import { type RuleExpressionNodeConversion } from '@/workflow/utils/internal/RuleExpressionNodeConversion';
import { ruleExpressionNodeBuilder } from '@/workflow/utils/internal/ruleExpressionNodeBuilder';

const PLAIN_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const ZERO_NODE: RuleExpressionNode = { source: '0', precedence: 'operand' };

// Rule expressions compare date-times as text, which only orders this exact shape
const CANONICAL_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const parseInstant = (value: string): Temporal.Instant | null => {
  try {
    return parseToInstantOrThrow(value);
  } catch {
    return null;
  }
};

const convertRelativeDateFilter = ({
  path,
  value,
}: {
  path: RuleExpressionNode;
  value: string;
}): RuleExpressionNodeConversion => {
  const relativeDateFilter = safeParseRelativeDateFilterJsonStringified(value);

  if (
    !isDefined(relativeDateFilter) ||
    (relativeDateFilter.direction !== 'THIS' &&
      !isDefined(relativeDateFilter.amount))
  ) {
    return { isConvertible: true, node: ruleExpressionNodeBuilder.false };
  }

  if (
    relativeDateFilter.unit === 'WEEK' &&
    isDefined(relativeDateFilter.firstDayOfTheWeek) &&
    relativeDateFilter.firstDayOfTheWeek !== FirstDayOfTheWeek.MONDAY
  ) {
    return {
      isConvertible: false,
      reason: 'rule expressions only start weeks on Monday',
    };
  }

  // The amount is ignored for THIS
  const amountNode = ruleExpressionNodeBuilder.number(
    relativeDateFilter.amount ?? 1,
  );

  if (!isDefined(amountNode)) {
    return {
      isConvertible: false,
      reason: `the relative date amount in "${value}" cannot be written`,
    };
  }

  return {
    isConvertible: true,
    node: ruleExpressionNodeBuilder.call(
      'isInRelativeDateRange',
      path,
      ruleExpressionNodeBuilder.string(relativeDateFilter.direction),
      amountNode,
      ruleExpressionNodeBuilder.string(relativeDateFilter.unit),
    ),
  };
};

// Legacy date filters compare instants in UTC, reading a plain date as its midnight
export const convertDateStepFilterToRuleExpressionNode = ({
  path,
  operand,
  value,
  isPlainDate,
}: {
  path: RuleExpressionNode;
  operand: ViewFilterOperand;
  value: string;
  isPlainDate: boolean;
}): RuleExpressionNodeConversion => {
  const nowNode = ruleExpressionNodeBuilder.path('now');

  switch (operand) {
    case ViewFilterOperand.IS_EMPTY:
      return {
        isConvertible: true,
        node: ruleExpressionNodeBuilder.call('isEmpty', path),
      };
    case ViewFilterOperand.IS_NOT_EMPTY:
      return {
        isConvertible: true,
        node: ruleExpressionNodeBuilder.not(
          ruleExpressionNodeBuilder.call('isEmpty', path),
        ),
      };
    case ViewFilterOperand.IS_IN_PAST:
      return isPlainDate
        ? {
            isConvertible: false,
            reason: 'a date is in the past from just after its midnight',
          }
        : {
            isConvertible: true,
            node: ruleExpressionNodeBuilder.compare(path, '<', nowNode),
          };
    case ViewFilterOperand.IS_IN_FUTURE:
      return {
        isConvertible: true,
        node: ruleExpressionNodeBuilder.compare(path, '>', nowNode),
      };
    case ViewFilterOperand.IS_TODAY:
      return {
        isConvertible: true,
        node: ruleExpressionNodeBuilder.compare(
          ruleExpressionNodeBuilder.call('daysSince', path),
          '==',
          ZERO_NODE,
        ),
      };
    case ViewFilterOperand.IS_RELATIVE:
      return convertRelativeDateFilter({ path, value });
    case ViewFilterOperand.IS:
    case ViewFilterOperand.IS_BEFORE:
    case ViewFilterOperand.IS_AFTER:
      break;
    default:
      return {
        isConvertible: false,
        reason: `the legacy filter fails on the ${operand} operand`,
      };
  }

  const instant = parseInstant(value);

  if (!isDefined(instant)) {
    return { isConvertible: true, node: ruleExpressionNodeBuilder.false };
  }

  const plainDate = instant.toZonedDateTimeISO('UTC').toPlainDate();
  const plainDateSource = plainDate.toString();
  const dateTimeSource = new Date(instant.epochMilliseconds).toISOString();

  const isWithinMilliseconds = Temporal.Instant.fromEpochMilliseconds(
    instant.epochMilliseconds,
  ).equals(instant);

  if (
    !PLAIN_DATE_PATTERN.test(plainDateSource) ||
    !CANONICAL_DATE_TIME_PATTERN.test(dateTimeSource) ||
    !isWithinMilliseconds
  ) {
    return {
      isConvertible: false,
      reason: `the date "${value}" cannot be compared as text`,
    };
  }

  const isMidnight = plainDate
    .toZonedDateTime('UTC')
    .toInstant()
    .equals(instant);
  const plainDateNode = ruleExpressionNodeBuilder.string(plainDateSource);
  const dateTimeNode = ruleExpressionNodeBuilder.string(dateTimeSource);

  // Next to a plain date literal, the engine compares a date-time by its UTC date
  switch (operand) {
    case ViewFilterOperand.IS:
      return {
        isConvertible: true,
        node: isPlainDate
          ? ruleExpressionNodeBuilder.compare(path, '==', plainDateNode)
          : ruleExpressionNodeBuilder.and(
              ruleExpressionNodeBuilder.compare(path, '>=', plainDateNode),
              ruleExpressionNodeBuilder.compare(path, '<=', plainDateNode),
            ),
      };
    case ViewFilterOperand.IS_BEFORE:
      return {
        isConvertible: true,
        node: isMidnight
          ? ruleExpressionNodeBuilder.compare(path, '<', plainDateNode)
          : isPlainDate
            ? ruleExpressionNodeBuilder.compare(path, '<=', plainDateNode)
            : ruleExpressionNodeBuilder.compare(path, '<', dateTimeNode),
      };
    default:
      return {
        isConvertible: true,
        node: isPlainDate
          ? ruleExpressionNodeBuilder.compare(path, '>', plainDateNode)
          : ruleExpressionNodeBuilder.compare(path, '>', dateTimeNode),
      };
  }
};
