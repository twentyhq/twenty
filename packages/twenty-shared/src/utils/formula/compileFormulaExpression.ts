import { VALIDATION_RULE_NOW_VARIABLE_NAME } from '@/constants/ValidationRuleNowVariableName';
import { compositeTypeDefinitions } from '@/types/composite-types/composite-type-definitions';
import { type FieldMetadataFormulaEvaluation } from '@/types/FieldMetadataFormulaEvaluation';
import { type ValidationRuleCompilationResult } from '@/types/ValidationRuleCompilationResult';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { compileExpression } from '@/utils/expression/compileExpression';
import { createExpressionEvaluator } from '@/utils/expression/createExpressionEvaluator';
import { getFormulaEvaluationFromBindings } from '@/utils/formula/getFormulaEvaluationFromBindings';
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

const UPDATED_AT_FIELD_NAME = 'updatedAt';

// Every recompute write bumps updatedAt, so a stored formula reading it could recompute forever
const findUpdatedAtPath = (paths: string[]): string | undefined =>
  paths.find((path) => path.split('.').pop() === UPDATED_AT_FIELD_NAME);

export const compileFormulaExpression = ({
  expression,
  fields,
  evaluation,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
  // The field's evaluation, which the other expression of a currency formula can make stored
  evaluation?: FieldMetadataFormulaEvaluation;
}): ValidationRuleCompilationResult => {
  const compilation = compileExpression({
    expression,
    fields,
    shouldAllowAggregates: true,
  });

  if (!compilation.isValid) {
    return compilation;
  }

  const paths = parseValidationRuleExpression(expression).variables({
    withMembers: true,
  });
  const compositePathWithoutPart = findCompositePathWithoutPart({
    paths,
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

  const isStored =
    evaluation === 'STORED' ||
    getFormulaEvaluationFromBindings({
      bindings: compilation.bindings,
      fields,
    }) === 'STORED';
  // `now` moves without any record changing, so a stored value reading it would go stale
  const unsupportedPath = isStored
    ? paths.find((path) => path === VALIDATION_RULE_NOW_VARIABLE_NAME)
    : undefined;

  const updatedAtPath = isStored ? findUpdatedAtPath(paths) : undefined;

  if (isDefined(updatedAtPath)) {
    return {
      isValid: false,
      errorMessage: `A stored formula cannot read "${updatedAtPath}"`,
      errorCode: 'UPDATED_AT_IN_STORED_FORMULA',
      errorParams: { path: updatedAtPath },
    };
  }

  if (isDefined(unsupportedPath)) {
    return {
      isValid: false,
      errorMessage: `A formula that aggregates related records is stored, so it cannot read "${unsupportedPath}". Aggregate in this field and read it from another formula.`,
      errorCode: 'NOT_SUPPORTED_IN_STORED_FORMULA',
      errorParams: { path: unsupportedPath },
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
