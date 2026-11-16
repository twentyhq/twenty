import { type ComputedFieldExpressionFunctionName } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { COMPUTED_FIELD_EXPRESSION_VARIABLE_SQL } from 'src/engine/metadata-modules/computed-field/constants/computed-field-expression-variable-sql.constant';
import { type ComputedFieldExpressionFunctionSqlRenderer } from 'src/engine/metadata-modules/computed-field/types/computed-field-expression-function-sql-renderer.type';

const rendering =
  (
    render: (argumentSqls: string[]) => string,
  ): ComputedFieldExpressionFunctionSqlRenderer =>
  ({ functionArguments, emitSql }) =>
    render(functionArguments.map(emitSql));

const calling = (sqlFunction: string) =>
  rendering((argumentSqls) => `${sqlFunction}(${argumentSqls.join(', ')})`);

export const COMPUTED_FIELD_EXPRESSION_FUNCTION_SQL = {
  if: rendering(
    ([condition, whenTrue, whenFalse]) =>
      `(CASE WHEN ${condition} THEN ${whenTrue} ELSE ${whenFalse} END)`,
  ),
  coalesce: calling('COALESCE'),
  isDefined: rendering(([value]) => `(${value} IS NOT NULL)`),
  isEmpty: rendering(([value]) => `(COALESCE(${value}::text, '') = '')`),
  min: calling('LEAST'),
  max: calling('GREATEST'),
  round: rendering(([number, precision]) =>
    isDefined(precision)
      ? `ROUND(${number}::numeric, ${precision}::int)`
      : `ROUND(${number}::numeric)`,
  ),
  abs: calling('ABS'),
  ceil: calling('CEIL'),
  floor: calling('FLOOR'),
  trunc: calling('TRUNC'),
  concat: calling('CONCAT'),
  lower: calling('LOWER'),
  upper: calling('UPPER'),
  length: calling('CHAR_LENGTH'),
  daysBetween: rendering(([from, to]) => `(${to}::date - ${from}::date)`),
  daysSince: rendering(
    ([from]) =>
      `(${COMPUTED_FIELD_EXPRESSION_VARIABLE_SQL.today} - ${from}::date)`,
  ),
} satisfies Record<
  ComputedFieldExpressionFunctionName,
  ComputedFieldExpressionFunctionSqlRenderer
>;
