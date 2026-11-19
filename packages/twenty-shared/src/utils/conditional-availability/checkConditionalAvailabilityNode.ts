import { CONDITIONAL_AVAILABILITY_FORBIDDEN_PATH_SEGMENT_PATTERN } from '@/constants/ConditionalAvailabilityForbiddenPathSegmentPattern';
import { CONDITIONAL_AVAILABILITY_FUNCTIONS } from '@/constants/ConditionalAvailabilityFunctions';
import { CONDITIONAL_AVAILABILITY_MAX_NODE_COUNT } from '@/constants/ConditionalAvailabilityMaxNodeCount';
import { CONDITIONAL_AVAILABILITY_SELECTED_RECORDS_VARIABLE_NAME } from '@/constants/ConditionalAvailabilitySelectedRecordsVariableName';
import { CONDITIONAL_AVAILABILITY_VARIABLES } from '@/constants/ConditionalAvailabilityVariables';
import { type ConditionalAvailabilityCheckResult } from '@/types/ConditionalAvailabilityCheckResult';
import { type ConditionalAvailabilityMetadataName } from '@/types/ConditionalAvailabilityMetadataName';
import { type ConditionalAvailabilityNode } from '@/types/ConditionalAvailabilityNode';
import { conditionalAvailabilityNodeSchema } from '@/utils/conditional-availability/conditionalAvailabilityNodeSchema';
import { listConditionalAvailabilityNodes } from '@/utils/conditional-availability/listConditionalAvailabilityNodes';
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
        CONDITIONAL_AVAILABILITY_FORBIDDEN_PATH_SEGMENT_PATTERN.test(segment),
      );
    }
    case 'CALL':
      return Object.prototype.hasOwnProperty.call(
        CONDITIONAL_AVAILABILITY_FUNCTIONS,
        node.functionName,
      )
        ? undefined
        : node.functionName;
    case 'SELECTED_RECORDS':
      return Object.prototype.hasOwnProperty.call(
        CONDITIONAL_AVAILABILITY_VARIABLES[metadataName],
        CONDITIONAL_AVAILABILITY_SELECTED_RECORDS_VARIABLE_NAME,
      )
        ? undefined
        : CONDITIONAL_AVAILABILITY_SELECTED_RECORDS_VARIABLE_NAME;
    case 'LITERAL':
    case 'COMPARISON':
    case 'GROUP':
    case 'NOT':
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

  let parsedNode: ConditionalAvailabilityNode;

  try {
    const schemaResult = conditionalAvailabilityNodeSchema.safeParse(node);

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

    parsedNode = schemaResult.data;
  } catch {
    return INVALID_NODE_AT_ROOT;
  }

  const nodes = listConditionalAvailabilityNodes({ node: parsedNode });

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

  return { isValid: true, node: parsedNode };
};
