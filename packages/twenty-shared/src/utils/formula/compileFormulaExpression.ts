import { VALIDATION_RULE_NOW_VARIABLE_NAME } from '@/constants/ValidationRuleNowVariableName';
import { compositeTypeDefinitions } from '@/types/composite-types/composite-type-definitions';
import { RelationType } from '@/types/RelationType';
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

const findPathUnsupportedInStoredFormula = ({
  paths,
  fields,
}: {
  paths: string[];
  fields: ValidationRuleFieldDescriptor[];
}): string | undefined => {
  const toOneRelationNames = new Set(
    fields
      .filter(({ relationType }) => relationType === RelationType.MANY_TO_ONE)
      .map(({ name }) => name),
  );

  return paths.find((path) => {
    const [rootSegment, ...memberSegments] = path.split('.');

    return (
      rootSegment === VALIDATION_RULE_NOW_VARIABLE_NAME ||
      (isDefined(rootSegment) &&
        toOneRelationNames.has(rootSegment) &&
        memberSegments.length > 0)
    );
  });
};

export const compileFormulaExpression = ({
  expression,
  fields,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
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

  const unsupportedPath =
    getFormulaEvaluationFromBindings({
      bindings: compilation.bindings,
      fields,
    }) === 'STORED'
      ? findPathUnsupportedInStoredFormula({ paths, fields })
      : undefined;

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
