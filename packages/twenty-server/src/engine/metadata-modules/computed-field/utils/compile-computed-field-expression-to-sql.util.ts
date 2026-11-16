import { type ComputedFieldValueType } from 'twenty-shared/types';
import {
  parseComputedFieldExpressionOrThrow,
  typeCheckComputedFieldExpressionOrThrow,
} from 'twenty-shared/utils';

import { type CompiledComputedFieldExpression } from 'src/engine/metadata-modules/computed-field/types/compiled-computed-field-expression.type';
import { emitComputedFieldExpressionSql } from 'src/engine/metadata-modules/computed-field/utils/emit-computed-field-expression-sql.util';

export const compileComputedFieldExpressionToSql = ({
  expression,
  resolveField,
}: {
  expression: string;
  resolveField: (path: string[]) => {
    sql: string;
    type: ComputedFieldValueType | undefined;
  };
}): CompiledComputedFieldExpression => {
  const typedExpression = typeCheckComputedFieldExpressionOrThrow({
    expression: parseComputedFieldExpressionOrThrow(expression),
    getFieldType: (path) => resolveField(path).type,
  });
  const parameters: Record<string, unknown> = {};

  const sql = emitComputedFieldExpressionSql({
    expression: typedExpression,
    resolveFieldSql: (path) => resolveField(path).sql,
    bindTextParameter: (text) => {
      const parameterName = `text${Object.keys(parameters).length}`;

      parameters[parameterName] = text;

      return parameterName;
    },
  });

  return { sql, type: typedExpression.type, parameters };
};
