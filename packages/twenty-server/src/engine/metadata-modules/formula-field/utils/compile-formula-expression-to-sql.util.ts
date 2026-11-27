import { isBoolean, isString } from '@sniptt/guards';
import {
  EXPRESSION_PREFIX_FUNCTION_NAMES,
  EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR,
  EXPRESSION_SYMBOL_BY_COMPARISON_OPERATOR,
  EXPRESSION_SYMBOL_BY_UNARY_OPERATOR,
  type ExpressionNode,
} from 'twenty-shared/expression';
import {
  assertUnreachable,
  getExpressionArgumentCountError,
  getFormulaAggregateCall,
  isDefined,
  parseExpressionNode,
} from 'twenty-shared/utils';

import { FORMULA_SQL_MAX_LENGTH } from 'src/engine/metadata-modules/formula-field/constants/formula-sql-max-length.constant';
import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { type FormulaSqlAggregationSource } from 'src/engine/metadata-modules/formula-field/types/formula-sql-aggregation-source.type';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import { compileFormulaSqlAggregateOrThrow } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-sql-aggregate.util';
import { compileFormulaSqlMembershipOrThrow } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-sql-membership.util';
import { compileFormulaSqlFunctionOrThrow } from 'src/engine/metadata-modules/formula-field/utils/formula-sql-functions.util';
import {
  compileFormulaSqlBinaryOperatorOrThrow,
  compileFormulaSqlUnaryOperatorOrThrow,
} from 'src/engine/metadata-modules/formula-field/utils/compile-formula-sql-operator.util';
import { buildTextLiteralValueOrThrow } from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';

export type FormulaSqlReferenceResolver = (
  path: string,
) => FormulaSqlValue | undefined;

export type FormulaSqlAggregationSourceResolver = (
  relationFieldName: string,
) => FormulaSqlAggregationSource | undefined;

const NOW_PATH = 'now';

const compileLiteralOrThrow = (
  literal: string | number | boolean,
): FormulaSqlValue => {
  if (isString(literal)) {
    return buildTextLiteralValueOrThrow(literal);
  }

  if (isBoolean(literal)) {
    return { sql: literal ? 'TRUE' : 'FALSE', type: 'boolean' };
  }

  if (!Number.isFinite(literal)) {
    throw new FormulaSqlCompilationException({
      message: `"${String(literal)}" is not supported in a formula`,
    });
  }

  return { sql: `${literal}::numeric`, type: 'number', isNeverNull: true };
};

type FormulaSqlCompilationContext = {
  resolveReference: FormulaSqlReferenceResolver;
  resolveAggregationSource?: FormulaSqlAggregationSourceResolver;
};

const compileAggregateOrThrow = ({
  callNode,
  context,
}: {
  callNode: Extract<ExpressionNode, { type: 'FUNCTION_CALL' }>;
  context: FormulaSqlCompilationContext;
}): FormulaSqlValue | undefined => {
  const { resolveAggregationSource } = context;
  const aggregateCall = getFormulaAggregateCall({
    callNode,
    getToManyRelationName: (path) => {
      const [relationFieldName] = path.split('.');

      return isDefined(relationFieldName) &&
        isDefined(resolveAggregationSource?.(relationFieldName))
        ? relationFieldName
        : undefined;
    },
  });

  if (!isDefined(aggregateCall)) {
    return undefined;
  }

  const [relationNode, conditionNode] = callNode.arguments;
  const aggregationSource = aggregateCall.isValid
    ? resolveAggregationSource?.(aggregateCall.relationName)
    : undefined;

  if (
    !aggregateCall.isValid ||
    !isDefined(relationNode) ||
    !isDefined(aggregationSource)
  ) {
    throw new FormulaSqlCompilationException({
      message: `${callNode.functionName}() needs a relation, for example count(tasks) or sum(deals.amount)`,
    });
  }

  return compileFormulaSqlAggregateOrThrow({
    functionName: aggregateCall.functionName,
    relationFieldName: aggregateCall.relationName,
    aggregationSource,
    aggregatedValue:
      aggregateCall.functionName === 'count'
        ? undefined
        : compileNodeOrThrow({ node: relationNode, context }),
    condition: isDefined(conditionNode)
      ? compileNodeOrThrow({ node: conditionNode, context })
      : undefined,
  });
};

const compileNodeSqlOrThrow = ({
  node,
  context,
}: {
  node: ExpressionNode;
  context: FormulaSqlCompilationContext;
}): FormulaSqlValue => {
  const compileChild = (child: ExpressionNode) =>
    compileNodeOrThrow({ node: child, context });

  const compileBinaryOperator = ({
    operator,
    left,
    right,
  }: {
    operator: string;
    left: ExpressionNode;
    right: ExpressionNode;
  }) =>
    compileFormulaSqlBinaryOperatorOrThrow({
      operator,
      left: compileChild(left),
      right: compileChild(right),
    });

  switch (node.type) {
    case 'LITERAL':
      return compileLiteralOrThrow(node.value);
    case 'VARIABLE': {
      if (node.path === NOW_PATH) {
        return { sql: 'NOW()', type: 'dateTime' };
      }

      const value = context.resolveReference(node.path);

      if (!isDefined(value)) {
        throw new FormulaSqlCompilationException({
          message: `"${node.path}" cannot be read by a formula`,
        });
      }

      return value;
    }
    case 'LIST':
      throw new FormulaSqlCompilationException({
        message: 'A list can only be written after "in"',
      });
    case 'FIELD':
      throw new FormulaSqlCompilationException({
        message: 'A field reference must be printed before it is compiled',
      });
    case 'MEMBER':
      throw new FormulaSqlCompilationException({
        message: `".${node.property}" can only follow a field`,
      });
    case 'NOT':
      return compileFormulaSqlUnaryOperatorOrThrow({
        operator: 'not',
        operand: compileChild(node.child),
      });
    case 'UNARY':
      return compileFormulaSqlUnaryOperatorOrThrow({
        operator: EXPRESSION_SYMBOL_BY_UNARY_OPERATOR[node.operator],
        operand: compileChild(node.operand),
      });
    case 'COMPARISON':
      return compileBinaryOperator({
        operator: EXPRESSION_SYMBOL_BY_COMPARISON_OPERATOR[node.operator],
        left: node.left,
        right: node.right,
      });
    case 'ARITHMETIC':
      return compileBinaryOperator({
        operator: EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR[node.operator],
        left: node.left,
        right: node.right,
      });
    case 'GROUP': {
      const operator = node.logicalOperator.toLowerCase();
      const [firstChild, ...otherChildren] = node.children.map(compileChild);

      if (!isDefined(firstChild)) {
        throw new FormulaSqlCompilationException({
          message: 'Formula is incomplete',
        });
      }

      return otherChildren.reduce(
        (left, right) =>
          compileFormulaSqlBinaryOperatorOrThrow({ operator, left, right }),
        firstChild,
      );
    }
    case 'IN': {
      if (node.list.type === 'LIST') {
        return compileFormulaSqlMembershipOrThrow({
          value: compileChild(node.value),
          candidates: node.list.items.map(compileChild),
        });
      }

      return compileBinaryOperator({
        operator: 'in',
        left: node.value,
        right: node.list,
      });
    }
    case 'CONCATENATION':
      return compileBinaryOperator({
        operator: '||',
        left: node.left,
        right: node.right,
      });
    case 'FUNCTION_CALL': {
      const [operandNode] = node.arguments;

      if (
        EXPRESSION_PREFIX_FUNCTION_NAMES.some(
          (prefixFunctionName) => prefixFunctionName === node.functionName,
        ) &&
        node.arguments.length === 1 &&
        isDefined(operandNode)
      ) {
        return compileFormulaSqlUnaryOperatorOrThrow({
          operator: node.functionName,
          operand: compileChild(operandNode),
        });
      }

      return (
        compileAggregateOrThrow({ callNode: node, context }) ??
        compileFormulaSqlFunctionOrThrow({
          name: node.functionName,
          formulaSqlValues: node.arguments.map(compileChild),
        })
      );
    }
    default:
      return assertUnreachable(node);
  }
};

const compileNodeOrThrow = ({
  node,
  context,
}: {
  node: ExpressionNode;
  context: FormulaSqlCompilationContext;
}): FormulaSqlValue => {
  const value = compileNodeSqlOrThrow({ node, context });

  if (value.sql.length > FORMULA_SQL_MAX_LENGTH) {
    throw new FormulaSqlCompilationException({
      message: 'This formula is too complex',
    });
  }

  return value;
};

export const compileFormulaExpressionToSqlOrThrow = ({
  expression,
  resolveReference,
  resolveAggregationSource,
}: {
  expression: string;
  resolveReference: FormulaSqlReferenceResolver;
  resolveAggregationSource?: FormulaSqlAggregationSourceResolver;
}): FormulaSqlValue => {
  const parseResult = parseExpressionNode(expression);

  if (!parseResult.isValid) {
    throw new FormulaSqlCompilationException({
      message: parseResult.errorMessage,
    });
  }

  const argumentCountError = getExpressionArgumentCountError(parseResult.node);

  if (isDefined(argumentCountError)) {
    throw new FormulaSqlCompilationException({
      message: argumentCountError.errorMessage,
    });
  }

  try {
    return compileNodeOrThrow({
      node: parseResult.node,
      context: { resolveReference, resolveAggregationSource },
    });
  } catch (error) {
    if (error instanceof FormulaSqlCompilationException) {
      throw error;
    }

    throw new FormulaSqlCompilationException({
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
