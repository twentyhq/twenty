import { assertUnreachable } from 'twenty-shared/utils';

import { buildRecordShareCondition } from 'src/engine/core-modules/record-share/utils/build-record-share-condition.util';
import { buildRecordCreatedByCondition } from 'src/engine/core-modules/record-share/utils/build-record-created-by-condition.util';
import { buildRecordPrivacyCondition } from 'src/engine/core-modules/record-share/utils/build-record-privacy-condition.util';
import {
  type CompiledRowAccessPolicy,
  type RowAccessExpression,
  type RowAccessPolicy,
  type RowAccessCompilationEnvironment,
  type SqlCondition,
} from 'src/engine/twenty-orm/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/twenty-orm/utils/combine-sql-conditions.util';

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
    case 'recordPrivacy':
      return buildRecordPrivacyCondition(expression);
    case 'recordCreatedBy':
      return buildRecordCreatedByCondition(expression);
    default:
      return assertUnreachable(expression);
  }
};
