import { type TypedComputedFieldExpressionNode } from 'twenty-shared/types';

// Receives the argument nodes, not their SQL: a literal argument that is syntax is read and never bound as a parameter
export type ComputedFieldExpressionFunctionSqlRenderer = (args: {
  functionArguments: TypedComputedFieldExpressionNode[];
  emitSql: (node: TypedComputedFieldExpressionNode) => string;
}) => string;
