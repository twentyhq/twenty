import { VALIDATION_RULE_NOW_VARIABLE_NAME } from '@/constants/ValidationRuleNowVariableName';
import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from '@/constants/ValidationRulePreviousVariableName';
import { type ExpressionFieldNode } from '@/expression/types/ExpressionFieldNode';
import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { isDefined } from '@/utils/validation/isDefined';

const findField = ({
  fields,
  name,
}: {
  fields: ValidationRuleFieldDescriptor[] | undefined;
  name: string | undefined;
}) => fields?.find((field) => field.name === name);

const toFieldNode = ({
  path,
  fields,
}: {
  path: string;
  fields: ValidationRuleFieldDescriptor[];
}): ExpressionFieldNode | undefined => {
  const [rootSegment, ...memberSegments] = path.split('.');

  if (rootSegment === VALIDATION_RULE_PREVIOUS_VARIABLE_NAME) {
    const [fieldName, subFieldName] = memberSegments;
    const field = findField({ fields, name: fieldName });

    return isDefined(field)
      ? {
          type: 'FIELD',
          fieldUniversalIdentifier: field.universalIdentifier,
          ...(isDefined(subFieldName) ? { subFieldName } : {}),
          isPreviousValue: true,
        }
      : undefined;
  }

  const rootField = findField({ fields, name: rootSegment });
  const [memberSegment, subFieldName] = memberSegments;

  if (!isDefined(rootField)) {
    return undefined;
  }

  if (!isDefined(rootField.relationTargetFields) || !isDefined(memberSegment)) {
    return {
      type: 'FIELD',
      fieldUniversalIdentifier: rootField.universalIdentifier,
      ...(isDefined(memberSegment) ? { subFieldName: memberSegment } : {}),
    };
  }

  const targetField = findField({
    fields: rootField.relationTargetFields,
    name: memberSegment,
  });

  return isDefined(targetField)
    ? {
        type: 'FIELD',
        relationFieldUniversalIdentifier: rootField.universalIdentifier,
        fieldUniversalIdentifier: targetField.universalIdentifier,
        ...(isDefined(subFieldName) ? { subFieldName } : {}),
      }
    : undefined;
};

// A path naming no field is kept as written, so the expression still reports it as unknown
export const resolveExpressionFieldReferences = ({
  node,
  fields,
}: {
  node: ExpressionNode;
  fields: ValidationRuleFieldDescriptor[];
}): ExpressionNode => {
  const resolve = (childNode: ExpressionNode) =>
    resolveExpressionFieldReferences({ node: childNode, fields });

  switch (node.type) {
    case 'VARIABLE':
      return node.path === VALIDATION_RULE_NOW_VARIABLE_NAME
        ? node
        : (toFieldNode({ path: node.path, fields }) ?? node);
    case 'LITERAL':
    case 'FIELD':
      return node;
    case 'COMPARISON':
    case 'ARITHMETIC':
    case 'CONCATENATION':
      return { ...node, left: resolve(node.left), right: resolve(node.right) };
    case 'GROUP':
      return { ...node, children: node.children.map(resolve) };
    case 'NOT':
      return { ...node, child: resolve(node.child) };
    case 'UNARY':
      return { ...node, operand: resolve(node.operand) };
    case 'FUNCTION_CALL':
      return { ...node, arguments: node.arguments.map(resolve) };
    case 'LIST':
      return { ...node, items: node.items.map(resolve) };
    case 'IN':
      return { ...node, value: resolve(node.value), list: resolve(node.list) };
  }
};
