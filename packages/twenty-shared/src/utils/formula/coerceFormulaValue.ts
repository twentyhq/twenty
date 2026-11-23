import { isBoolean, isNumber, isString } from '@sniptt/guards';

import { RATING_VALUES } from '@/constants/RatingValues';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type FormulaFieldMetadataType } from '@/types/FormulaFieldMetadataType';
import { type FormulaValue } from '@/types/FormulaValue';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { formatExpressionDate } from '@/utils/expression-date/formatExpressionDate';
import { parseExpressionDate } from '@/utils/expression-date/parseExpressionDate';
import { isDefined } from '@/utils/validation/isDefined';

const coerceToText = (value: unknown): string | null => {
  if (isString(value)) {
    return value;
  }

  return isNumber(value) || isBoolean(value) ? String(value) : null;
};

const coerceToDate = (value: unknown): string | null => {
  const expressionDate = parseExpressionDate(value);

  if (!isDefined(expressionDate)) {
    return null;
  }

  return expressionDate.isDateOnly
    ? expressionDate.date.toString()
    : expressionDate.dateTime.toPlainDate().toString();
};

const coerceToDateTime = (value: unknown): string | null => {
  const expressionDate = parseExpressionDate(value);

  if (!isDefined(expressionDate)) {
    return null;
  }

  if (!expressionDate.isDateOnly) {
    return formatExpressionDate(expressionDate);
  }

  return formatExpressionDate({
    isDateOnly: false,
    dateTime: expressionDate.date.toZonedDateTime('UTC'),
  });
};

const coerceToRating = (value: unknown): string | null => {
  if (isNumber(value)) {
    return RATING_VALUES[value - 1] ?? null;
  }

  return RATING_VALUES.find((ratingValue) => ratingValue === value) ?? null;
};

// Without the options a select value cannot be trusted, so it is dropped
const coerceToSelectOption = ({
  value,
  selectOptionValues,
}: {
  value: unknown;
  selectOptionValues: readonly string[];
}): string | null =>
  isString(value) && selectOptionValues.includes(value) ? value : null;

export const coerceFormulaValue = ({
  value,
  fieldMetadataType,
  selectOptionValues = [],
}: {
  value: unknown;
  fieldMetadataType: FormulaFieldMetadataType;
  selectOptionValues?: readonly string[];
}): FormulaValue => {
  switch (fieldMetadataType) {
    case FieldMetadataType.TEXT:
      return coerceToText(value);
    case FieldMetadataType.NUMBER:
      return isNumber(value) && Number.isFinite(value) ? value : null;
    case FieldMetadataType.BOOLEAN:
      return isBoolean(value) ? value : null;
    case FieldMetadataType.DATE:
      return coerceToDate(value);
    case FieldMetadataType.DATE_TIME:
      return coerceToDateTime(value);
    case FieldMetadataType.SELECT:
      return coerceToSelectOption({ value, selectOptionValues });
    case FieldMetadataType.RATING:
      return coerceToRating(value);
    case FieldMetadataType.CURRENCY:
      return isNumber(value) && Number.isFinite(value)
        ? Math.round(value)
        : null;
    default:
      return assertUnreachable(fieldMetadataType);
  }
};
