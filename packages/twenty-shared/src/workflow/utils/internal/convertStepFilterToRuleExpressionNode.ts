import { isString } from '@sniptt/guards';

import { RATING_VALUES } from '@/constants/RatingValues';
import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from '@/constants/ValidationRulePreviousVariableName';
import { type StepFilterWithPotentiallyDeprecatedOperand } from '@/types/StepFilters';
import { type ValidationRuleDatabaseEventAction } from '@/types/ValidationRuleDatabaseEventAction';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { convertViewFilterOperandToCoreOperand } from '@/utils/filter/utils/convert-view-filter-operand-to-core-operand.util';
import { isDefined } from '@/utils/validation/isDefined';
import { isVariableReference } from '@/utils/variable-resolver';
import { buildStepFilterContainsRuleExpressionNode } from '@/workflow/utils/internal/buildStepFilterContainsRuleExpressionNode';
import { convertDateStepFilterToRuleExpressionNode } from '@/workflow/utils/internal/convertDateStepFilterToRuleExpressionNode';
import { mapStepOutputKeyToRuleExpressionPath } from '@/workflow/utils/internal/mapStepOutputKeyToRuleExpressionPath';
import { type RuleExpressionNode } from '@/workflow/utils/internal/RuleExpressionNode';
import { type RuleExpressionNodeConversion } from '@/workflow/utils/internal/RuleExpressionNodeConversion';
import { ruleExpressionNodeBuilder } from '@/workflow/utils/internal/ruleExpressionNodeBuilder';

type TextValueKind = 'text' | 'list';

type ConstantComparison = {
  path: RuleExpressionNode;
  operand: ViewFilterOperand;
  value: string;
};

// Subfields whose value is always text or a list, so the legacy text filter
// never stringifies a number or an object
const TEXT_VALUE_KIND_BY_COMPOSITE_SUBFIELD: Partial<
  Record<string, Record<string, TextValueKind>>
> = {
  FULL_NAME: { firstName: 'text', lastName: 'text' },
  EMAILS: { primaryEmail: 'text', additionalEmails: 'list' },
  PHONES: {
    primaryPhoneNumber: 'text',
    primaryPhoneCountryCode: 'text',
    primaryPhoneCallingCode: 'text',
    additionalPhones: 'list',
  },
  ADDRESS: {
    addressStreet1: 'text',
    addressStreet2: 'text',
    addressCity: 'text',
    addressState: 'text',
    addressPostcode: 'text',
    addressCountry: 'text',
  },
  LINKS: {
    primaryLinkUrl: 'text',
    primaryLinkLabel: 'text',
    secondaryLinks: 'list',
  },
  ACTOR: { name: 'text' },
};

const unconvertible = (reason: string): RuleExpressionNodeConversion => ({
  isConvertible: false,
  reason,
});

const converted = (node: RuleExpressionNode): RuleExpressionNodeConversion => ({
  isConvertible: true,
  node,
});

const unsupportedOperand = (operand: ViewFilterOperand, type: string) =>
  unconvertible(`the legacy ${type} filter fails on the ${operand} operand`);

const buildPath = ({
  isPrevious,
  segments,
}: {
  isPrevious: boolean;
  segments: string[];
}) =>
  ruleExpressionNodeBuilder.path(
    [
      ...(isPrevious ? [VALIDATION_RULE_PREVIOUS_VARIABLE_NAME] : []),
      ...segments,
    ].join('.'),
  );

const isEmptyNode = (path: RuleExpressionNode) =>
  ruleExpressionNodeBuilder.call('isEmpty', path);

const convertEmptinessOperand = (
  path: RuleExpressionNode,
  operand: ViewFilterOperand,
): RuleExpressionNode | undefined => {
  if (operand === ViewFilterOperand.IS_EMPTY) {
    return isEmptyNode(path);
  }

  if (operand === ViewFilterOperand.IS_NOT_EMPTY) {
    return ruleExpressionNodeBuilder.not(isEmptyNode(path));
  }

  return undefined;
};

const convertTextFilter = (
  { path, operand, value }: ConstantComparison,
  valueKind: TextValueKind,
): RuleExpressionNodeConversion => {
  const emptinessNode = convertEmptinessOperand(path, operand);

  if (isDefined(emptinessNode)) {
    return converted(emptinessNode);
  }

  const valueNode = ruleExpressionNodeBuilder.string(value);

  switch (operand) {
    case ViewFilterOperand.IS:
      return converted(
        ruleExpressionNodeBuilder.compare(path, '==', valueNode),
      );
    case ViewFilterOperand.IS_NOT:
      return converted(
        ruleExpressionNodeBuilder.compare(path, '!=', valueNode),
      );
    case ViewFilterOperand.CONTAINS:
    case ViewFilterOperand.DOES_NOT_CONTAIN:
      break;
    default:
      return unsupportedOperand(operand, 'text');
  }

  const containsConversion = buildStepFilterContainsRuleExpressionNode({
    path,
    value,
    valueKind,
  });

  if (!containsConversion.isConvertible) {
    return containsConversion;
  }

  // An empty text value also matches empty fields, the legacy null-equivalent value
  const isNullEquivalentValue = valueKind === 'text' && value === '';

  return converted(
    operand === ViewFilterOperand.CONTAINS
      ? ruleExpressionNodeBuilder.or(
          containsConversion.node,
          isNullEquivalentValue
            ? isEmptyNode(path)
            : ruleExpressionNodeBuilder.false,
        )
      : ruleExpressionNodeBuilder.or(
          ruleExpressionNodeBuilder.not(containsConversion.node),
          isNullEquivalentValue
            ? ruleExpressionNodeBuilder.not(isEmptyNode(path))
            : ruleExpressionNodeBuilder.false,
        ),
  );
};

const parseSelectOptions = (value: string): string[] => {
  try {
    const parsedValue: unknown = JSON.parse(value);

    return Array.isArray(parsedValue) ? parsedValue.filter(isString) : [value];
  } catch {
    return [value];
  }
};

const convertSelectFilter = ({
  path,
  operand,
  value,
}: ConstantComparison): RuleExpressionNodeConversion => {
  const emptinessNode = convertEmptinessOperand(path, operand);

  if (isDefined(emptinessNode)) {
    return converted(emptinessNode);
  }

  if (
    operand !== ViewFilterOperand.IS &&
    operand !== ViewFilterOperand.IS_NOT
  ) {
    return unsupportedOperand(operand, 'select');
  }

  const options = parseSelectOptions(value);
  const nonEmptyOptions = options.filter((option) => option !== '');

  // The empty option "" stands for a select without a value
  const matchNode = ruleExpressionNodeBuilder.or(
    ruleExpressionNodeBuilder.isIn(path, nonEmptyOptions),
    nonEmptyOptions.length !== options.length
      ? ruleExpressionNodeBuilder.not(
          ruleExpressionNodeBuilder.call('isDefined', path),
        )
      : ruleExpressionNodeBuilder.false,
  );

  return converted(
    operand === ViewFilterOperand.IS
      ? matchNode
      : ruleExpressionNodeBuilder.not(matchNode),
  );
};

const convertNumberFilter = (
  { path, operand, value }: ConstantComparison,
  { isEqualitySupported }: { isEqualitySupported: boolean },
): RuleExpressionNodeConversion => {
  const emptinessNode = convertEmptinessOperand(path, operand);

  if (isDefined(emptinessNode)) {
    return converted(emptinessNode);
  }

  const comparisonOperator =
    operand === ViewFilterOperand.GREATER_THAN_OR_EQUAL
      ? '>='
      : operand === ViewFilterOperand.LESS_THAN_OR_EQUAL
        ? '<='
        : isEqualitySupported && operand === ViewFilterOperand.IS
          ? '=='
          : isEqualitySupported && operand === ViewFilterOperand.IS_NOT
            ? '!='
            : undefined;

  if (!isDefined(comparisonOperator)) {
    return isEqualitySupported
      ? unsupportedOperand(operand, 'number')
      : unconvertible(
          `a numeric value can be text, which the legacy ${operand} filter converts to a number`,
        );
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return converted(
      comparisonOperator === '!='
        ? ruleExpressionNodeBuilder.true
        : ruleExpressionNodeBuilder.false,
    );
  }

  const numberNode = ruleExpressionNodeBuilder.number(number);

  if (!isDefined(numberNode)) {
    return unconvertible(`the number "${value}" cannot be written`);
  }

  return converted(
    ruleExpressionNodeBuilder.compare(path, comparisonOperator, numberNode),
  );
};

// Same parsing as the legacy rating filter
const parseRatingRank = (value: string): number | undefined => {
  if (value.length === 0) {
    return undefined;
  }

  const ratingPrefixMatch = value.match(/^RATING_(\d+)$/);

  if (isDefined(ratingPrefixMatch)) {
    return Number(ratingPrefixMatch[1]);
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
};

const convertRatingFilter = ({
  path,
  operand,
  value,
}: ConstantComparison): RuleExpressionNodeConversion => {
  const emptinessNode = convertEmptinessOperand(path, operand);

  if (isDefined(emptinessNode)) {
    return converted(emptinessNode);
  }

  const rank = parseRatingRank(value);

  const buildRatingsInNode = (
    isMatchingRank: (ratingRank: number) => boolean,
  ) =>
    ruleExpressionNodeBuilder.isIn(
      path,
      RATING_VALUES.filter((rating) =>
        isMatchingRank(Number(rating.replace('RATING_', ''))),
      ),
    );

  switch (operand) {
    case ViewFilterOperand.IS:
      return converted(buildRatingsInNode((ratingRank) => ratingRank === rank));
    case ViewFilterOperand.IS_NOT:
      return converted(
        ruleExpressionNodeBuilder.not(
          buildRatingsInNode((ratingRank) => ratingRank === rank),
        ),
      );
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL:
      return converted(
        buildRatingsInNode(
          (ratingRank) => isDefined(rank) && ratingRank >= rank,
        ),
      );
    case ViewFilterOperand.LESS_THAN_OR_EQUAL:
      return converted(
        buildRatingsInNode(
          (ratingRank) => isDefined(rank) && ratingRank <= rank,
        ),
      );
    default:
      return unsupportedOperand(operand, 'rating');
  }
};

const convertIdentifierFilter = ({
  path,
  operand,
  value,
}: ConstantComparison): RuleExpressionNodeConversion => {
  const emptinessNode = convertEmptinessOperand(path, operand);

  if (isDefined(emptinessNode)) {
    return converted(emptinessNode);
  }

  const valueNode = ruleExpressionNodeBuilder.string(value);

  switch (operand) {
    case ViewFilterOperand.IS:
      return converted(
        ruleExpressionNodeBuilder.compare(path, '==', valueNode),
      );
    case ViewFilterOperand.IS_NOT:
      return converted(
        ruleExpressionNodeBuilder.compare(path, '!=', valueNode),
      );
    default:
      return unsupportedOperand(operand, 'identifier');
  }
};

const convertBooleanFilter = ({
  path,
  operand,
  value,
}: ConstantComparison): RuleExpressionNodeConversion => {
  if (operand !== ViewFilterOperand.IS) {
    return unsupportedOperand(operand, 'boolean');
  }

  if (value === 'false') {
    return unconvertible(
      'a rule expression reads an empty boolean as false, which the legacy "is false" filter does not match',
    );
  }

  return converted(
    value === 'true'
      ? ruleExpressionNodeBuilder.compare(
          path,
          '==',
          ruleExpressionNodeBuilder.true,
        )
      : ruleExpressionNodeBuilder.false,
  );
};

const VARIABLE_COMPARABLE_FIELD_TYPES = ['TEXT', 'UUID', 'NUMBER'];

const isVariableComparableField = ({
  stepFilter,
  segments,
}: {
  stepFilter: StepFilterWithPotentiallyDeprecatedOperand;
  segments: string[];
}) => {
  if (segments.length === 1) {
    return VARIABLE_COMPARABLE_FIELD_TYPES.includes(stepFilter.type);
  }

  const subfieldName = stepFilter.compositeFieldSubFieldName;

  if (
    segments.length !== 2 ||
    !isDefined(subfieldName) ||
    subfieldName !== segments[1]
  ) {
    return false;
  }

  return (
    (stepFilter.type === 'CURRENCY' && subfieldName === 'amountMicros') ||
    TEXT_VALUE_KIND_BY_COMPOSITE_SUBFIELD[stepFilter.type]?.[subfieldName] ===
      'text'
  );
};

// Only "field compared with its other snapshot" on an update converts: both
// snapshots then carry the field, so the value is null and never missing,
// and a null value turns the legacy IS into IS_EMPTY and IS_NOT into IS_NOT_EMPTY
const convertTriggerRecordVariableComparison = ({
  stepFilter,
  operand,
  databaseEventAction,
  leftSnapshot,
  leftIsPrevious,
  leftSegments,
}: {
  stepFilter: StepFilterWithPotentiallyDeprecatedOperand;
  operand: ViewFilterOperand;
  databaseEventAction: ValidationRuleDatabaseEventAction;
  leftSnapshot: 'after' | 'before';
  leftIsPrevious: boolean;
  leftSegments: string[];
}): RuleExpressionNodeConversion => {
  const rightMapping = mapStepOutputKeyToRuleExpressionPath({
    stepOutputKey: stepFilter.value,
    databaseEventAction,
  });

  const isSameFieldOtherSnapshot =
    databaseEventAction === 'updated' &&
    rightMapping.isMapped &&
    rightMapping.snapshot !== leftSnapshot &&
    rightMapping.segments.join('.') === leftSegments.join('.');

  if (
    !isSameFieldOtherSnapshot ||
    !isVariableComparableField({ stepFilter, segments: leftSegments }) ||
    (operand !== ViewFilterOperand.IS && operand !== ViewFilterOperand.IS_NOT)
  ) {
    return unconvertible(
      `only comparing a text, number or identifier field with its value before or after an update converts, not "${stepFilter.value}"`,
    );
  }

  const leftPath = buildPath({
    isPrevious: leftIsPrevious,
    segments: leftSegments,
  });
  const rightPath = buildPath({
    isPrevious: !leftIsPrevious,
    segments: leftSegments,
  });
  const isRightDefinedNode = ruleExpressionNodeBuilder.call(
    'isDefined',
    rightPath,
  );

  return converted(
    operand === ViewFilterOperand.IS
      ? ruleExpressionNodeBuilder.or(
          ruleExpressionNodeBuilder.compare(leftPath, '==', rightPath),
          ruleExpressionNodeBuilder.and(
            ruleExpressionNodeBuilder.not(isRightDefinedNode),
            isEmptyNode(leftPath),
          ),
        )
      : ruleExpressionNodeBuilder.and(
          ruleExpressionNodeBuilder.compare(leftPath, '!=', rightPath),
          ruleExpressionNodeBuilder.or(
            isRightDefinedNode,
            ruleExpressionNodeBuilder.not(isEmptyNode(leftPath)),
          ),
        ),
  );
};

const convertCompositeFilter = ({
  stepFilter,
  comparison,
  subfieldName,
}: {
  stepFilter: StepFilterWithPotentiallyDeprecatedOperand;
  comparison: ConstantComparison;
  subfieldName: string | undefined;
}): RuleExpressionNodeConversion => {
  if (!isDefined(subfieldName)) {
    return unconvertible(
      `the ${stepFilter.type} filter does not read one of its subfields`,
    );
  }

  if (stepFilter.type === 'CURRENCY') {
    if (subfieldName === 'amountMicros') {
      return convertNumberFilter(comparison, { isEqualitySupported: true });
    }

    if (subfieldName !== 'currencyCode') {
      return unconvertible(`the currency subfield ${subfieldName} is a number`);
    }

    // The legacy currency code filter reads IS as contains
    const emptinessNode = convertEmptinessOperand(
      comparison.path,
      comparison.operand,
    );

    if (isDefined(emptinessNode)) {
      return converted(emptinessNode);
    }

    if (
      comparison.operand !== ViewFilterOperand.IS &&
      comparison.operand !== ViewFilterOperand.IS_NOT
    ) {
      return unsupportedOperand(comparison.operand, 'currency');
    }

    const containsConversion = buildStepFilterContainsRuleExpressionNode({
      path: comparison.path,
      value: comparison.value,
      valueKind: 'text',
    });

    return !containsConversion.isConvertible ||
      comparison.operand === ViewFilterOperand.IS
      ? containsConversion
      : converted(ruleExpressionNodeBuilder.not(containsConversion.node));
  }

  if (stepFilter.type === 'ACTOR') {
    if (subfieldName === 'source') {
      return convertSelectFilter(comparison);
    }

    if (subfieldName === 'workspaceMemberId') {
      return convertIdentifierFilter(comparison);
    }
  }

  const textValueKind =
    TEXT_VALUE_KIND_BY_COMPOSITE_SUBFIELD[stepFilter.type]?.[subfieldName];

  return isDefined(textValueKind)
    ? convertTextFilter(comparison, textValueKind)
    : unconvertible(
        `the ${stepFilter.type} subfield ${subfieldName} is not always text`,
      );
};

export const convertStepFilterToRuleExpressionNode = ({
  stepFilter,
  databaseEventAction,
}: {
  stepFilter: StepFilterWithPotentiallyDeprecatedOperand;
  databaseEventAction: ValidationRuleDatabaseEventAction;
}): RuleExpressionNodeConversion => {
  const operand: ViewFilterOperand | undefined =
    convertViewFilterOperandToCoreOperand(stepFilter.operand);

  if (!isDefined(operand)) {
    return unconvertible(`the operand ${stepFilter.operand} is unknown`);
  }

  if (!isString(stepFilter.value)) {
    return unconvertible('the value is not text');
  }

  const leftMapping = mapStepOutputKeyToRuleExpressionPath({
    stepOutputKey: stepFilter.stepOutputKey,
    databaseEventAction,
  });

  if (!leftMapping.isMapped) {
    return unconvertible(leftMapping.reason);
  }

  const isFullRelationRecord =
    stepFilter.type === 'RELATION' && stepFilter.isFullRecord === true;
  const segments = isFullRelationRecord
    ? [...leftMapping.segments, 'id']
    : leftMapping.segments;

  if (segments.length === 0) {
    return unconvertible('the filter reads the whole record');
  }

  if (isVariableReference(stepFilter.value)) {
    return convertTriggerRecordVariableComparison({
      stepFilter,
      operand,
      databaseEventAction,
      leftSnapshot: leftMapping.snapshot,
      leftIsPrevious: leftMapping.isPrevious,
      leftSegments: segments,
    });
  }

  const comparison: ConstantComparison = {
    path: buildPath({ isPrevious: leftMapping.isPrevious, segments }),
    operand,
    value: stepFilter.value,
  };

  const lastSegment = segments[segments.length - 1];
  const subfieldName =
    stepFilter.compositeFieldSubFieldName === lastSegment
      ? lastSegment
      : undefined;

  switch (stepFilter.type) {
    case 'TEXT':
      return convertTextFilter(comparison, 'text');
    case 'MULTI_SELECT':
    case 'ARRAY':
      return convertTextFilter(comparison, 'list');
    case 'SELECT':
      return convertSelectFilter(comparison);
    case 'NUMBER':
      return convertNumberFilter(comparison, { isEqualitySupported: true });
    case 'NUMERIC':
      return convertNumberFilter(comparison, { isEqualitySupported: false });
    case 'RATING':
      return convertRatingFilter(comparison);
    case 'UUID':
      return convertIdentifierFilter(comparison);
    case 'RELATION':
      // Only an id compares as is, the legacy filter reads .id of a record
      return isFullRelationRecord ||
        lastSegment === 'id' ||
        lastSegment?.endsWith('Id') === true
        ? convertIdentifierFilter(comparison)
        : unconvertible('the relation filter does not read an id');
    case 'BOOLEAN':
      return convertBooleanFilter(comparison);
    case 'DATE':
    case 'DATE_TIME':
      return convertDateStepFilterToRuleExpressionNode({
        ...comparison,
        isPlainDate: stepFilter.type === 'DATE',
      });
    case 'FULL_NAME':
    case 'EMAILS':
    case 'PHONES':
    case 'ADDRESS':
    case 'LINKS':
    case 'CURRENCY':
    case 'ACTOR':
      return convertCompositeFilter({ stepFilter, comparison, subfieldName });
    default:
      return unconvertible(
        `${stepFilter.type} filters are compared loosely or as JSON by the legacy evaluator`,
      );
  }
};
