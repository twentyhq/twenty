import { CONDITIONAL_EVALUATION_CONFIGURATION_BY_METADATA_NAME } from '@/conditional-evaluation/common/constants/ConditionalEvaluationConfigurationByMetadataName';
import { CONDITIONAL_EVALUATION_MAX_NODE_COUNT } from '@/conditional-evaluation/validate/constants/ConditionalEvaluationMaxNodeCount';
import { type ConditionalEvaluationMetadataName } from '@/conditional-evaluation/common/types/ConditionalEvaluationMetadataName';
import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';
import { type ConditionalEvaluationValidationResult } from '@/conditional-evaluation/validate/types/ConditionalEvaluationValidationResult';
import { conditionalEvaluationNodeSchema } from '@/conditional-evaluation/validate/utils/conditionalEvaluationNodeSchema';
import { listConditionalEvaluationNodes } from '@/conditional-evaluation/validate/utils/listConditionalEvaluationNodes';
import { isDefined } from '@/utils/validation/isDefined';

const INVALID_NODE_AT_ROOT = {
  isValid: false,
  errorCode: 'INVALID_NODE',
  errorMessage: 'The rule is not a valid tree',
  errorParams: { path: '' },
} as const;

const getUnknownName = ({
  node,
  metadataName,
}: {
  node: ConditionalEvaluationNode;
  metadataName: ConditionalEvaluationMetadataName;
}): string | undefined => {
  const configuration =
    CONDITIONAL_EVALUATION_CONFIGURATION_BY_METADATA_NAME[metadataName];

  switch (node.type) {
    case 'VARIABLE': {
      const [variableName] = node.path.split('.');

      if (!isDefined(variableName)) {
        return undefined;
      }

      return Object.prototype.hasOwnProperty.call(
        configuration.variables,
        variableName,
      )
        ? undefined
        : variableName;
    }
    case 'FUNCTION_CALL':
      return Object.prototype.hasOwnProperty.call(
        configuration.functions,
        node.functionName,
      )
        ? undefined
        : node.functionName;
    case 'COMPARISON':
      return configuration.comparisonOperators.includes(node.operator)
        ? undefined
        : node.operator;
    case 'LITERAL':
    case 'GROUP':
    case 'NOT':
      return undefined;
  }
};

const safeParseNodeSchema = (node: unknown) => {
  try {
    return conditionalEvaluationNodeSchema.safeParse(node);
  } catch {
    return undefined;
  }
};

export const validateConditionalEvaluationNode = ({
  node,
  metadataName,
}: {
  node: unknown;
  metadataName: ConditionalEvaluationMetadataName;
}): ConditionalEvaluationValidationResult => {
  if (!isDefined(node)) {
    return { isValid: true, node: null };
  }

  const schemaResult = safeParseNodeSchema(node);

  if (!isDefined(schemaResult)) {
    return INVALID_NODE_AT_ROOT;
  }

  if (!schemaResult.success) {
    const [firstIssue] = schemaResult.error.issues;

    if (!isDefined(firstIssue)) {
      return INVALID_NODE_AT_ROOT;
    }

    const path = firstIssue.path.join('.');

    return {
      isValid: false,
      errorCode: 'INVALID_NODE',
      errorMessage: `Invalid rule at "${path}": ${firstIssue.message}`,
      errorParams: { path },
    };
  }

  const nodes = listConditionalEvaluationNodes({ node: schemaResult.data });

  if (nodes.length > CONDITIONAL_EVALUATION_MAX_NODE_COUNT) {
    return {
      isValid: false,
      errorCode: 'RULE_TOO_LARGE',
      errorMessage: `The rule has more than ${CONDITIONAL_EVALUATION_MAX_NODE_COUNT} parts`,
      errorParams: { maxNodeCount: CONDITIONAL_EVALUATION_MAX_NODE_COUNT },
    };
  }

  const unknownName = nodes
    .map((currentNode) => getUnknownName({ node: currentNode, metadataName }))
    .find(isDefined);

  if (isDefined(unknownName)) {
    return {
      isValid: false,
      errorCode: 'UNKNOWN_NAME',
      errorMessage: `"${unknownName}" is not a variable, function or operator available on ${metadataName}`,
      errorParams: { name: unknownName },
    };
  }

  return { isValid: true, node: schemaResult.data };
};
