import { compositeTypeDefinitions } from '@/types/composite-types/composite-type-definitions';
import { type ValidationRuleCompilationResult } from '@/types/ValidationRuleCompilationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { compileExpression } from '@/utils/expression/compileExpression';
import { createExpressionEvaluator } from '@/utils/expression/createExpressionEvaluator';
import { isDefined } from '@/utils/validation/isDefined';
import { isValidationRulePreviousValuePath } from '@/utils/validation-rule/isValidationRulePreviousValuePath';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';

// A composite field has one column per part, so a formula has to name the part it reads
const findCompositePathWithoutPart = ({
  paths,
  fields,
}: {
  paths: string[];
  fields: ValidationRuleFieldDescriptor[];
}): { path: string; partName: string } | undefined => {
  for (const path of paths) {
    const [rootSegment, ...memberSegments] = path.split('.');
    const rootField = fields.find(({ name }) => name === rootSegment);
    const readField =
      memberSegments.length === 0
        ? rootField
        : memberSegments.length === 1
          ? rootField?.relationTargetFields?.find(
              ({ name }) => name === memberSegments[0],
            )
          : undefined;
    const partName = isDefined(readField)
      ? compositeTypeDefinitions.get(readField.type)?.properties[0]?.name
      : undefined;

    if (isDefined(partName)) {
      return { path, partName };
    }
  }

  return undefined;
};

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

  const compositePathWithoutPart = findCompositePathWithoutPart({
    paths: parseValidationRuleExpression(expression).variables({
      withMembers: true,
    }),
    fields,
  });

  if (isDefined(compositePathWithoutPart)) {
    const { path, partName } = compositePathWithoutPart;

    return {
      isValid: false,
      errorMessage: `"${path}" has several parts: read one of them, such as ${path}.${partName}`,
      errorCode: 'COMPOSITE_FIELD_WITHOUT_PART',
      errorParams: { path, subfieldName: partName },
    };
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
