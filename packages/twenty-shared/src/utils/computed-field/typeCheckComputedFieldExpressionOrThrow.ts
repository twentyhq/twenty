import { COMPUTED_FIELD_EXPRESSION_FUNCTIONS } from '@/constants/ComputedFieldExpressionFunctions';
import { type ComputedFieldExpressionNode } from '@/types/ComputedFieldExpressionNode';
import { type ComputedFieldExpressionVariableName } from '@/types/ComputedFieldExpressionVariableName';
import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type TypedComputedFieldExpressionNode } from '@/types/TypedComputedFieldExpressionNode';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { ComputedFieldExpressionError } from '@/utils/computed-field/ComputedFieldExpressionError';
import { assertComputedFieldExpressionTypeOrThrow } from '@/utils/computed-field/internal/assertComputedFieldExpressionTypeOrThrow';
import { checkComputedFieldExpressionBinaryOperationOrThrow } from '@/utils/computed-field/internal/checkComputedFieldExpressionBinaryOperationOrThrow';
import { getComputedFieldExpressionUnifiedType } from '@/utils/computed-field/internal/getComputedFieldExpressionUnifiedType';
import { isComputedFieldExpressionFunctionName } from '@/utils/computed-field/internal/isComputedFieldExpressionFunctionName';
import { unifyComputedFieldExpressionOperandOrThrow } from '@/utils/computed-field/internal/unifyComputedFieldExpressionOperandOrThrow';

const { NUMBER, TEXT, BOOLEAN, DATE, DATE_TIME } = FieldMetadataType;

const VARIABLE_TYPE_BY_NAME: Record<
  ComputedFieldExpressionVariableName,
  ComputedFieldValueType
> = { now: DATE_TIME, today: DATE };

export const typeCheckComputedFieldExpressionOrThrow = ({
  expression,
  getFieldType,
}: {
  expression: ComputedFieldExpressionNode;
  getFieldType: (path: string[]) => ComputedFieldValueType | undefined;
}): TypedComputedFieldExpressionNode => {
  const check = (
    node: ComputedFieldExpressionNode,
  ): TypedComputedFieldExpressionNode => {
    switch (node.kind) {
      case 'textLiteral':
        return { ...node, type: TEXT };
      case 'numberLiteral':
        return { ...node, type: NUMBER };
      case 'booleanLiteral':
        return { ...node, type: BOOLEAN };
      case 'fieldPath':
        return { ...node, type: getFieldType(node.path) };
      case 'variable':
        return { ...node, type: VARIABLE_TYPE_BY_NAME[node.name] };
      case 'unaryOperation': {
        const operand = check(node.operand);
        const type = node.operator === 'not' ? BOOLEAN : NUMBER;

        assertComputedFieldExpressionTypeOrThrow({
          type: operand.type,
          allowedTypes: [type],
          usage: `"${node.operator}"`,
        });

        return { ...node, operand, type };
      }
      case 'binaryOperation':
        return {
          ...node,
          ...checkComputedFieldExpressionBinaryOperationOrThrow({
            operator: node.operator,
            left: check(node.left),
            right:
              node.operator === 'in' && node.right.kind === 'list'
                ? {
                    ...node.right,
                    items: node.right.items.map(check),
                    type: undefined,
                  }
                : check(node.right),
          }),
        };
      case 'conditional': {
        const condition = check(node.condition);
        const whenTrue = check(node.whenTrue);
        const whenFalse = check(node.whenFalse);
        const usage = '"? :"';

        assertComputedFieldExpressionTypeOrThrow({
          type: condition.type,
          allowedTypes: [BOOLEAN],
          usage: `The condition of ${usage}`,
        });

        const type = getComputedFieldExpressionUnifiedType([
          whenTrue,
          whenFalse,
        ]);
        const unify = (operand: TypedComputedFieldExpressionNode) =>
          unifyComputedFieldExpressionOperandOrThrow({ operand, type, usage });

        return {
          ...node,
          condition,
          whenTrue: unify(whenTrue),
          whenFalse: unify(whenFalse),
          type,
        };
      }
      case 'functionCall': {
        const functionArguments = node.functionArguments.map(check);

        if (!isComputedFieldExpressionFunctionName(node.name)) {
          throw new ComputedFieldExpressionError(
            `Unknown function "${node.name}"`,
          );
        }

        const {
          minimumArgumentCount,
          maximumArgumentCount,
          checkArgumentsOrThrow,
        } = COMPUTED_FIELD_EXPRESSION_FUNCTIONS[node.name];

        if (
          functionArguments.length < minimumArgumentCount ||
          functionArguments.length > maximumArgumentCount
        ) {
          throw new ComputedFieldExpressionError(
            `"${node.name}" does not take ${functionArguments.length} argument(s)`,
          );
        }

        return {
          kind: 'functionCall',
          name: node.name,
          ...checkArgumentsOrThrow({
            functionArguments,
            usage: `"${node.name}"`,
          }),
        };
      }
      case 'list':
        throw new ComputedFieldExpressionError(
          'A list can only be used after "in"',
        );
      default:
        return assertUnreachable(node);
    }
  };

  return check(expression);
};
