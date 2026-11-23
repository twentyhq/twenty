import { type FormulaFieldMetadataType } from '@/types/FormulaFieldMetadataType';
import { type FormulaEvaluator } from '@/types/FormulaEvaluator';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { createExpressionEvaluator } from '@/utils/expression/createExpressionEvaluator';
import { coerceFormulaValue } from '@/utils/formula/coerceFormulaValue';

export const createFormulaEvaluator = ({
  expression,
  fields,
  fieldMetadataType,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
  fieldMetadataType: FormulaFieldMetadataType;
}): FormulaEvaluator => {
  const evaluateExpression = createExpressionEvaluator({ expression, fields });

  return ({ record, now }) => {
    const evaluation = evaluateExpression({ record, now });

    return evaluation.status === 'evaluated'
      ? coerceFormulaValue({ value: evaluation.value, fieldMetadataType })
      : null;
  };
};
