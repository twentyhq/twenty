import { isNumber } from '@sniptt/guards';

import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type FormulaEvaluator } from '@/types/FormulaEvaluator';
import { type FormulaFieldMetadataType } from '@/types/FormulaFieldMetadataType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { createExpressionEvaluator } from '@/utils/expression/createExpressionEvaluator';
import { coerceFormulaCurrencyCode } from '@/utils/formula/coerceFormulaCurrencyCode';
import { coerceFormulaValue } from '@/utils/formula/coerceFormulaValue';
import { isDefined } from '@/utils/validation/isDefined';

export const createFormulaEvaluator = ({
  expression,
  currencyCodeExpression,
  fields,
  fieldMetadataType,
}: {
  expression: string;
  currencyCodeExpression?: string;
  fields: ValidationRuleFieldDescriptor[];
  fieldMetadataType: FormulaFieldMetadataType;
}): FormulaEvaluator => {
  const evaluateExpression = createExpressionEvaluator({ expression, fields });
  const evaluateCurrencyCodeExpression = isDefined(currencyCodeExpression)
    ? createExpressionEvaluator({ expression: currencyCodeExpression, fields })
    : undefined;

  return ({ record, now, selectOptionValues }) => {
    const evaluation = evaluateExpression({ record, now });
    const value =
      evaluation.status === 'evaluated'
        ? coerceFormulaValue({
            value: evaluation.value,
            fieldMetadataType,
            selectOptionValues,
          })
        : null;

    if (fieldMetadataType !== FieldMetadataType.CURRENCY) {
      return value;
    }

    const currencyCodeEvaluation = evaluateCurrencyCodeExpression?.({
      record,
      now,
    });
    const currencyCode =
      currencyCodeEvaluation?.status === 'evaluated'
        ? coerceFormulaCurrencyCode(currencyCodeEvaluation.value)
        : null;

    return isNumber(value) && isDefined(currencyCode)
      ? { amountMicros: value, currencyCode }
      : null;
  };
};
