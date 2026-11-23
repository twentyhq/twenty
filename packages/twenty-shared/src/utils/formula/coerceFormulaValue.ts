import { isBoolean, isNumber, isString } from '@sniptt/guards';

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

export const coerceFormulaValue = ({
  value,
  fieldMetadataType,
}: {
  value: unknown;
  fieldMetadataType: FormulaFieldMetadataType;
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
    default:
      return assertUnreachable(fieldMetadataType);
  }
};
