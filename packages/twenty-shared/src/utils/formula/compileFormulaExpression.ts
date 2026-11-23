import { type ValidationRuleCompilationResult } from '@/types/ValidationRuleCompilationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { compileExpression } from '@/utils/expression/compileExpression';
import { createExpressionEvaluator } from '@/utils/expression/createExpressionEvaluator';
import { isDefined } from '@/utils/validation/isDefined';
import { isValidationRulePreviousValuePath } from '@/utils/validation-rule/isValidationRulePreviousValuePath';

export const compileFormulaExpression = ({
  expression,
  fields,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
}): ValidationRuleCompilationResult => {
  const compilation = compileExpression({ expression, fields });

  if (!compilation.isValid) {
    return compilation;
  }

  const previousValuePath = Object.keys(compilation.bindings).find(
    isValidationRulePreviousValuePath,
  );

  if (isDefined(previousValuePath)) {
    return {
      isValid: false,
      errorMessage: `"${previousValuePath}" reads a previous value, which a formula cannot use`,
      errorCode: 'PREVIOUS_VALUE_IN_FORMULA',
      errorParams: { path: previousValuePath },
    };
  }

  const emptyRecordEvaluation = createExpressionEvaluator({
    expression,
    fields,
  })({ record: {}, now: new Date().toISOString() });

  if (emptyRecordEvaluation.status === 'errored') {
    return {
      isValid: false,
      errorMessage: emptyRecordEvaluation.errorMessage,
      errorCode: emptyRecordEvaluation.errorCode,
    };
  }

  return compilation;
};
