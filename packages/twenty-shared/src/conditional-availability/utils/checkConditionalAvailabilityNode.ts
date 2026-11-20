import { CONDITIONAL_AVAILABILITY_FORBIDDEN_PROPERTY_NAMES } from '@/conditional-availability/constants/ConditionalAvailabilityForbiddenPropertyNames';
import { CONDITIONAL_AVAILABILITY_FUNCTIONS } from '@/conditional-availability/constants/ConditionalAvailabilityFunctions';
import { CONDITIONAL_AVAILABILITY_MAX_NODE_COUNT } from '@/conditional-availability/constants/ConditionalAvailabilityMaxNodeCount';
import { CONDITIONAL_AVAILABILITY_VARIABLES } from '@/conditional-availability/constants/ConditionalAvailabilityVariables';
import { type ConditionalAvailabilityCheckResult } from '@/conditional-availability/types/ConditionalAvailabilityCheckResult';
import { type ConditionalAvailabilityMetadataName } from '@/conditional-availability/types/ConditionalAvailabilityMetadataName';
import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';
import { conditionalAvailabilityNodeSchema } from '@/conditional-availability/utils/conditionalAvailabilityNodeSchema';
import { listConditionalAvailabilityNodes } from '@/conditional-availability/utils/listConditionalAvailabilityNodes';
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
  node: ConditionalAvailabilityNode;
  metadataName: ConditionalAvailabilityMetadataName;
}): string | undefined => {
  switch (node.type) {
    case 'PATH': {
      const segments = node.path.split('.');
      const [rootName] = segments;

      if (
        isDefined(rootName) &&
        !Object.prototype.hasOwnProperty.call(
          CONDITIONAL_AVAILABILITY_VARIABLES[metadataName],
          rootName,
        )
      ) {
        return rootName;
      }

      return segments.find((segment) =>
        CONDITIONAL_AVAILABILITY_FORBIDDEN_PROPERTY_NAMES.has(segment),
      );
    }
    case 'CALL':
      return Object.prototype.hasOwnProperty.call(
        CONDITIONAL_AVAILABILITY_FUNCTIONS,
        node.functionName,
      )
        ? undefined
        : node.functionName;
    case 'LITERAL':
    case 'COMPARISON':
    case 'GROUP':
    case 'NOT':
      return undefined;
  }
};

const safeParseNodeSchema = (node: unknown) => {
  try {
    return conditionalAvailabilityNodeSchema.safeParse(node);
  } catch {
    return undefined;
  }
};

export const checkConditionalAvailabilityNode = ({
  node,
  metadataName,
}: {
  node: unknown;
  metadataName: ConditionalAvailabilityMetadataName;
}): ConditionalAvailabilityCheckResult => {
  if (!isDefined(node)) {
    return { isValid: true, node: null };
  }

  const schemaResult = safeParseNodeSchema(node);

  if (!isDefined(schemaResult)) {
    return INVALID_NODE_AT_ROOT;
  }

  if (!schemaResult.success) {
    const [firstIssue] = schemaResult.error.issues;
    const path = firstIssue?.path.join('.') ?? '';

    return {
      isValid: false,
      errorCode: 'INVALID_NODE',
      errorMessage: isDefined(firstIssue)
        ? `Invalid rule at "${path}": ${firstIssue.message}`
        : INVALID_NODE_AT_ROOT.errorMessage,
      errorParams: { path },
    };
  }

  const nodes = listConditionalAvailabilityNodes({ node: schemaResult.data });

  if (nodes.length > CONDITIONAL_AVAILABILITY_MAX_NODE_COUNT) {
    return {
      isValid: false,
      errorCode: 'RULE_TOO_LARGE',
      errorMessage: `The rule has more than ${CONDITIONAL_AVAILABILITY_MAX_NODE_COUNT} parts`,
      errorParams: { maxNodeCount: CONDITIONAL_AVAILABILITY_MAX_NODE_COUNT },
    };
  }

  const unknownName = nodes
    .map((currentNode) => getUnknownName({ node: currentNode, metadataName }))
    .find(isDefined);

  if (isDefined(unknownName)) {
    return {
      isValid: false,
      errorCode: 'UNKNOWN_NAME',
      errorMessage: `"${unknownName}" is not a variable or function available on ${metadataName}`,
      errorParams: { name: unknownName },
    };
  }

  return { isValid: true, node: schemaResult.data };
};
