import {
  type ComputedFieldExpressionUnaryOperator,
  FieldMetadataType,
  type TypedComputedFieldExpressionNode,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { COMPUTED_FIELD_EXPRESSION_BINARY_OPERATOR_SQL } from 'src/engine/metadata-modules/computed-field/constants/computed-field-expression-binary-operator-sql.constant';
import { COMPUTED_FIELD_EXPRESSION_FUNCTION_SQL } from 'src/engine/metadata-modules/computed-field/constants/computed-field-expression-function-sql.constant';
import { COMPUTED_FIELD_EXPRESSION_VARIABLE_SQL } from 'src/engine/metadata-modules/computed-field/constants/computed-field-expression-variable-sql.constant';

const TEXT_LITERAL_SQL_TYPE: Partial<Record<FieldMetadataType, string>> = {
  [FieldMetadataType.DATE]: 'date',
  [FieldMetadataType.DATE_TIME]: 'timestamptz',
};

const UNARY_OPERATOR_SQL = {
  not: (operand) => `(NOT ${operand})`,
  '-': (operand) => `(-${operand})`,
  '+': (operand) => operand,
} satisfies Record<
  ComputedFieldExpressionUnaryOperator,
  (operand: string) => string
>;

// The tree is already type checked: this only writes SQL
export const emitComputedFieldExpressionSql = ({
  expression,
  resolveFieldSql,
  bindTextParameter,
}: {
  expression: TypedComputedFieldExpressionNode;
  resolveFieldSql: (path: string[]) => string;
  bindTextParameter: (text: string) => string;
}): string => {
  const emitSql = (node: TypedComputedFieldExpressionNode): string => {
    switch (node.kind) {
      case 'textLiteral': {
        const sqlType = isDefined(node.type)
          ? (TEXT_LITERAL_SQL_TYPE[node.type] ?? 'text')
          : 'text';

        return `:${bindTextParameter(node.value)}::${sqlType}`;
      }
      case 'numberLiteral':
        return String(node.value);
      case 'booleanLiteral':
        return node.value ? 'TRUE' : 'FALSE';
      case 'fieldPath':
        return resolveFieldSql(node.path);
      case 'variable':
        return COMPUTED_FIELD_EXPRESSION_VARIABLE_SQL[node.name];
      case 'unaryOperation':
        return UNARY_OPERATOR_SQL[node.operator](emitSql(node.operand));
      case 'binaryOperation': {
        const left = emitSql(node.left);

        return COMPUTED_FIELD_EXPRESSION_BINARY_OPERATOR_SQL[node.operator](
          left,
          emitSql(node.right),
        );
      }
      case 'conditional':
        return COMPUTED_FIELD_EXPRESSION_FUNCTION_SQL.if({
          functionArguments: [node.condition, node.whenTrue, node.whenFalse],
          emitSql,
        });
      case 'functionCall':
        return COMPUTED_FIELD_EXPRESSION_FUNCTION_SQL[node.name]({
          functionArguments: node.functionArguments,
          emitSql,
        });
      case 'list':
        return `(${node.items.map(emitSql).join(', ')})`;
      default:
        return assertUnreachable(node);
    }
  };

  return emitSql(expression);
};
