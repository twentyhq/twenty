import { isNumber, isString } from '@sniptt/guards';

import { AI_FORM_MAX_TEXT_ANSWER_LENGTH } from '@/ai/constants/ai-form-max-text-answer-length.const';
import { type RequestFormField } from '@/ai/types/RequestFormToolInput';
import { isAiFormInlineSelectSettings } from '@/ai/utils/is-ai-form-inline-select-settings.util';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isDefined } from '@/utils/validation/isDefined';
import { isValidUuid } from '@/utils/validation/isValidUuid';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/;

const isEmptyAnswer = (value: unknown): boolean =>
  !isDefined(value) ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

const getAllowedInlineValues = (field: RequestFormField) =>
  isAiFormInlineSelectSettings(field.settings)
    ? new Set(field.settings.options.map((option) => option.value))
    : undefined;

const validateFieldValue = (
  field: RequestFormField,
  value: unknown,
): string | undefined => {
  switch (field.type) {
    case 'TEXT':
      if (!isString(value)) {
        return `${field.label} must be text.`;
      }

      return value.length > AI_FORM_MAX_TEXT_ANSWER_LENGTH
        ? `${field.label} is too long.`
        : undefined;
    case 'NUMBER':
      return isNumber(value) && Number.isFinite(value)
        ? undefined
        : `${field.label} must be a number.`;
    case 'DATE':
      return isString(value) &&
        DATE_PATTERN.test(value) &&
        !Number.isNaN(Date.parse(value))
        ? undefined
        : `${field.label} must be a valid date.`;
    case 'SELECT': {
      if (!isString(value)) {
        return `${field.label} must be one of its options.`;
      }

      const allowedValues = getAllowedInlineValues(field);

      return isDefined(allowedValues) && !allowedValues.has(value)
        ? `${field.label} must be one of its options.`
        : undefined;
    }
    case 'MULTI_SELECT': {
      if (!Array.isArray(value) || !value.every(isString)) {
        return `${field.label} must be a list of its options.`;
      }

      if (new Set(value).size !== value.length) {
        return `${field.label} lists an option more than once.`;
      }

      const allowedValues = getAllowedInlineValues(field);

      return isDefined(allowedValues) &&
        value.some((item) => !allowedValues.has(item))
        ? `${field.label} must only list its options.`
        : undefined;
    }
    case 'RECORD':
      return isPlainObject(value) && isString(value.id) && isValidUuid(value.id)
        ? undefined
        : `${field.label} must be a record picked from the list.`;
    default:
      return `${field.label} has an unsupported type.`;
  }
};

// The shape checks every client and the server agree on. Whether a picked
// record is accessible, or a metadata option still exists, is decided by the
// server against the workspace. Old forms that never set `required` keep
// their optional semantics.
export const validateAiFormAnswers = ({
  fields,
  values,
}: {
  fields: RequestFormField[];
  values: Record<string, unknown>;
}): string[] => {
  const errors: string[] = [];
  const fieldNames = new Set(fields.map((field) => field.name));

  for (const fieldName of Object.keys(values)) {
    if (!fieldNames.has(fieldName)) {
      errors.push(`The form has no field named ${fieldName}.`);
    }
  }

  for (const field of fields) {
    const value = values[field.name];

    if (isEmptyAnswer(value)) {
      if (field.settings?.required === true) {
        errors.push(`${field.label} is required.`);
      }

      continue;
    }

    const error = validateFieldValue(field, value);

    if (isDefined(error)) {
      errors.push(error);
    }
  }

  return errors;
};
