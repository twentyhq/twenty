import { isArray, isString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type IntegrityRule,
  type IntegrityRuleCondition,
} from 'src/modules/integrity-rules/types/integrity-rule.type';
import { type IntegrityRuleField } from 'src/modules/integrity-rules/types/integrity-rule-field.type';
import { type IntegrityViolation } from 'src/modules/integrity-rules/types/integrity-violation.type';
import { isIntegrityFieldValueEmpty } from 'src/modules/integrity-rules/utils/is-integrity-field-value-empty.util';

type EvaluateIntegrityRulesArgs = {
  rules: IntegrityRule[];
  fieldsByName: Record<string, IntegrityRuleField>;
  previousRecord?: Partial<ObjectRecord>;
  record: Partial<ObjectRecord>;
};

const getFieldValue = (
  record: Partial<ObjectRecord>,
  field: IntegrityRuleField,
): unknown => record[field.recordKey] ?? record[field.name];

const toValueList = (value: unknown): unknown[] =>
  isArray(value) ? value : [value];

const formatValue = (field: IntegrityRuleField, value: unknown): string => {
  if (!isDefined(value)) {
    return 'empty';
  }

  return isString(value) ? (field.optionLabels[value] ?? value) : String(value);
};

const formatValueList = (field: IntegrityRuleField, values: string[]) =>
  values.map((value) => formatValue(field, value)).join(' or ');

const matchesCondition = (
  condition: IntegrityRuleCondition,
  record: Partial<ObjectRecord>,
  fieldsByName: Record<string, IntegrityRuleField>,
): boolean => {
  const field = fieldsByName[condition.field];

  if (!isDefined(field)) {
    return false;
  }

  const values = toValueList(getFieldValue(record, field));

  if (
    isDefined(condition.in) &&
    !values.some((value) => condition.in?.includes(value as string))
  ) {
    return false;
  }

  if (
    isDefined(condition.notIn) &&
    values.some((value) => condition.notIn?.includes(value as string))
  ) {
    return false;
  }

  return true;
};

const describeCondition = (
  condition: IntegrityRuleCondition,
  fieldsByName: Record<string, IntegrityRuleField>,
): string => {
  const field = fieldsByName[condition.field];
  const parts: string[] = [];

  if (isDefined(condition.in)) {
    parts.push(`${field.label} is ${formatValueList(field, condition.in)}`);
  }

  if (isDefined(condition.notIn)) {
    parts.push(
      `${field.label} is not ${formatValueList(field, condition.notIn)}`,
    );
  }

  return parts.join(' and ');
};

const withWhenClause = (
  message: string,
  rule: IntegrityRule,
  fieldsByName: Record<string, IntegrityRuleField>,
): string => {
  if (!isDefined(rule.when) || rule.when.length === 0) {
    return message;
  }

  const whenText = rule.when
    .map((condition) => describeCondition(condition, fieldsByName))
    .join(' and ');

  return `${message} when ${whenText}`;
};

const evaluateRule = (
  rule: IntegrityRule,
  { fieldsByName, previousRecord, record }: EvaluateIntegrityRulesArgs,
): IntegrityViolation | undefined => {
  switch (rule.category) {
    case 'REQUIRED_FIELDS': {
      const missingFields = rule.fields
        .map((fieldName) => fieldsByName[fieldName])
        .filter(isDefined)
        .filter((field) =>
          isIntegrityFieldValueEmpty(field.type, getFieldValue(record, field)),
        );

      if (missingFields.length === 0) {
        return undefined;
      }

      const labels = missingFields.map((field) => field.label).join(', ');

      return {
        ruleKey: rule.key,
        category: rule.category,
        fields: missingFields.map((field) => field.name),
        message: withWhenClause(`${labels} must be filled`, rule, fieldsByName),
      };
    }
    case 'ALLOWED_VALUES': {
      const field = fieldsByName[rule.constraint.field];

      if (!isDefined(field)) {
        return undefined;
      }

      const value = getFieldValue(record, field);

      if (
        isIntegrityFieldValueEmpty(field.type, value) ||
        matchesCondition(rule.constraint, record, fieldsByName)
      ) {
        return undefined;
      }

      return {
        ruleKey: rule.key,
        category: rule.category,
        fields: [field.name],
        message: withWhenClause(
          `${field.label} can't be ${toValueList(value)
            .map((item) => formatValue(field, item))
            .join(', ')}`,
          rule,
          fieldsByName,
        ),
      };
    }
    case 'STATUS_TRANSITION': {
      const field = fieldsByName[rule.field];

      if (!isDefined(field) || !isDefined(previousRecord)) {
        return undefined;
      }

      const previousValue = getFieldValue(previousRecord, field);
      const nextValue = getFieldValue(record, field);

      if (!isString(previousValue) || previousValue === nextValue) {
        return undefined;
      }

      const allowedNextValues = rule.allowedTransitions[previousValue];

      if (
        !isDefined(allowedNextValues) ||
        allowedNextValues.includes(nextValue as string)
      ) {
        return undefined;
      }

      return {
        ruleKey: rule.key,
        category: rule.category,
        fields: [field.name],
        message: withWhenClause(
          `${field.label} can't go from ${formatValue(field, previousValue)} to ${formatValue(field, nextValue)}`,
          rule,
          fieldsByName,
        ),
      };
    }
  }
};

export const evaluateIntegrityRules = (
  args: EvaluateIntegrityRulesArgs,
): IntegrityViolation[] =>
  args.rules
    .filter((rule) =>
      (rule.when ?? []).every((condition) =>
        matchesCondition(condition, args.record, args.fieldsByName),
      ),
    )
    .map((rule) => evaluateRule(rule, args))
    .filter(isDefined);
