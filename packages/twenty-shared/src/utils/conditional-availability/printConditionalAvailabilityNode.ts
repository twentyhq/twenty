import { isNonEmptyString, isString } from '@sniptt/guards';

import { CONDITIONAL_AVAILABILITY_COMPARISON_OPERATOR_SYMBOLS } from '@/constants/ConditionalAvailabilityComparisonOperatorSymbols';
import { CONDITIONAL_AVAILABILITY_RECORD_QUANTIFIER_FUNCTION_NAMES } from '@/constants/ConditionalAvailabilityRecordQuantifierFunctionNames';
import { CONDITIONAL_AVAILABILITY_SELECTED_RECORDS_VARIABLE_NAME } from '@/constants/ConditionalAvailabilitySelectedRecordsVariableName';
import { type ConditionalAvailabilityLogicalOperator } from '@/types/ConditionalAvailabilityLogicalOperator';
import { type ConditionalAvailabilityNode } from '@/types/ConditionalAvailabilityNode';

const BACKSLASH_BEFORE_CLOSING_QUOTE_PATTERN = /\\\\"$/;
const UNICODE_ESCAPED_BACKSLASH_AND_CLOSING_QUOTE = '\\u005c"';

const printConditionalAvailabilityText = ({ text }: { text: string }): string =>
  JSON.stringify(text).replace(
    BACKSLASH_BEFORE_CLOSING_QUOTE_PATTERN,
    UNICODE_ESCAPED_BACKSLASH_AND_CLOSING_QUOTE,
  );

const printInParentheses = (node: ConditionalAvailabilityNode): string =>
  `(${printConditionalAvailabilityNode({ node })})`;

const printOperand = (node: ConditionalAvailabilityNode): string =>
  node.type === 'COMPARISON' || node.type === 'GROUP'
    ? printInParentheses(node)
    : printConditionalAvailabilityNode({ node });

const printGroupChild = ({
  node,
  logicalOperator,
}: {
  node: ConditionalAvailabilityNode;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): string =>
  node.type === 'GROUP' &&
  node.children.length > 1 &&
  node.logicalOperator !== logicalOperator
    ? printInParentheses(node)
    : printConditionalAvailabilityNode({ node });

export const printConditionalAvailabilityNode = ({
  node,
}: {
  node: ConditionalAvailabilityNode;
}): string => {
  switch (node.type) {
    case 'LITERAL':
      return isString(node.value)
        ? printConditionalAvailabilityText({ text: node.value })
        : String(node.value);
    case 'PATH':
      return node.path;
    case 'COMPARISON':
      return [
        printOperand(node.left),
        CONDITIONAL_AVAILABILITY_COMPARISON_OPERATOR_SYMBOLS[node.operator],
        printOperand(node.right),
      ].join(' ');
    case 'GROUP':
      return node.children
        .map((childNode) =>
          printGroupChild({
            node: childNode,
            logicalOperator: node.logicalOperator,
          }),
        )
        .join(node.logicalOperator === 'AND' ? ' and ' : ' or ');
    case 'NOT':
      return `not ${printOperand(node.child)}`;
    case 'CALL':
      return `${node.functionName}(${node.arguments
        .map((argumentNode) =>
          printConditionalAvailabilityNode({ node: argumentNode }),
        )
        .join(', ')})`;
    case 'SELECTED_RECORDS': {
      const { fieldMetadataUniversalIdentifier, subFieldName, operand, value } =
        node.recordFilter;
      const fieldReference = isNonEmptyString(subFieldName)
        ? `${fieldMetadataUniversalIdentifier}.${subFieldName}`
        : fieldMetadataUniversalIdentifier;
      const textArguments = isNonEmptyString(value)
        ? [fieldReference, operand, value]
        : [fieldReference, operand];

      return `${
        CONDITIONAL_AVAILABILITY_RECORD_QUANTIFIER_FUNCTION_NAMES[
          node.quantifier
        ]
      }(${[
        CONDITIONAL_AVAILABILITY_SELECTED_RECORDS_VARIABLE_NAME,
        ...textArguments.map((text) =>
          printConditionalAvailabilityText({ text }),
        ),
      ].join(', ')})`;
    }
  }
};
