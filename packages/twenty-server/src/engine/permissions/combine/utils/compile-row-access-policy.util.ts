import { assertUnreachable } from 'twenty-shared/utils';

import { buildRecordShareCondition } from 'src/engine/permissions/record-share/utils/build-record-share-condition.util';
import { buildRecordShareExceptionCondition } from 'src/engine/permissions/record-share/utils/build-record-share-exception-condition.util';
import {
  type CompiledRowAccessPolicy,
  type RowAccessExpression,
  type RowAccessPolicy,
  type RowAccessCompilationEnvironment,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/permissions/combine/utils/combine-sql-conditions.util';

export const compileRowAccessPolicy = ({
  policy,
  environment,
}: {
  policy: RowAccessPolicy;
  environment: RowAccessCompilationEnvironment;
}): CompiledRowAccessPolicy =>
  policy.kind === 'gated'
    ? {
        kind: 'gated',
        condition: compileRowAccessExpression({
          expression: policy.expression,
          environment,
        }),
      }
    : policy;

export const compileRowAccessExpression = ({
  expression,
  environment,
}: {
  expression: RowAccessExpression;
  environment: RowAccessCompilationEnvironment;
}): SqlCondition => {
  switch (expression.kind) {
    case 'and':
    case 'or':
      return combineSqlConditions(
        expression.operands.map((operand) =>
          compileRowAccessExpression({ expression: operand, environment }),
        ),
        expression.kind === 'or' ? 'OR' : 'AND',
      );
    case 'roleFilter':
      return expression.condition;
    case 'recordShared':
      return buildRecordShareCondition({
        ...expression,
        recordShareTableExpression: environment.recordShareTableExpression,
      });
    case 'recordNotRestricted':
      return buildRecordShareExceptionCondition({
        ...expression,
        recordShareTableExpression: environment.recordShareTableExpression,
      });
    default:
      return assertUnreachable(expression);
  }
};
