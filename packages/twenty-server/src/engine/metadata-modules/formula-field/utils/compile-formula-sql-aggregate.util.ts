import { type FormulaAggregateFunctionName } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { type FormulaSqlAggregationSource } from 'src/engine/metadata-modules/formula-field/types/formula-sql-aggregation-source.type';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import { getFormulaSqlAggregateAlias } from 'src/engine/metadata-modules/formula-field/utils/get-formula-sql-aggregate-alias.util';
import {
  assertFormulaSqlTypeOrThrow,
  describeFormulaSqlType,
} from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';
import { quoteColumn } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { COMPUTED_COLUMN_RECORD_ALIAS } from 'src/engine/twenty-orm/table-shape/constants/computed-column-record-alias.constant';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const assertAggregatedValueOrThrow = ({
  functionName,
  aggregatedValue,
}: {
  functionName: Exclude<FormulaAggregateFunctionName, 'count'>;
  aggregatedValue: FormulaSqlValue;
}): FormulaSqlValue => {
  const usage = `${functionName}()`;

  if (functionName === 'sum' || functionName === 'avg') {
    return assertFormulaSqlTypeOrThrow({
      value: aggregatedValue,
      type: 'number',
      usage,
    });
  }

  if (
    aggregatedValue.type !== 'number' &&
    aggregatedValue.type !== 'date' &&
    aggregatedValue.type !== 'dateTime'
  ) {
    throw new FormulaSqlCompilationException({
      message: `${usage} needs a number or a date, but got ${describeFormulaSqlType(aggregatedValue.type)}`,
    });
  }

  return aggregatedValue;
};

export const compileFormulaSqlAggregateOrThrow = ({
  functionName,
  relationFieldName,
  aggregationSource,
  aggregatedValue,
  condition,
}: {
  functionName: FormulaAggregateFunctionName;
  relationFieldName: string;
  aggregationSource: FormulaSqlAggregationSource;
  aggregatedValue?: FormulaSqlValue;
  condition?: FormulaSqlValue;
}): FormulaSqlValue => {
  const alias = getFormulaSqlAggregateAlias(relationFieldName);
  const conditionSql = isDefined(condition)
    ? ` AND (${
        assertFormulaSqlTypeOrThrow({
          value: condition,
          type: 'boolean',
          usage: `The condition of ${functionName}()`,
        }).sql
      })`
    : '';
  const fromSql = `FROM ${aggregationSource.tableSql} AS ${escapeIdentifier(alias)} WHERE ${quoteColumn(alias, aggregationSource.joinColumnName)} = ${quoteColumn(COMPUTED_COLUMN_RECORD_ALIAS, 'id')} AND ${quoteColumn(alias, 'deletedAt')} IS NULL${conditionSql}`;

  if (functionName === 'count') {
    return {
      sql: `(SELECT COUNT(*)::numeric ${fromSql})`,
      type: 'number',
      isNeverNull: true,
    };
  }

  if (!isDefined(aggregatedValue)) {
    throw new FormulaSqlCompilationException({
      message: `${functionName}() needs a field of the related records`,
    });
  }

  const { sql, type } = assertAggregatedValueOrThrow({
    functionName,
    aggregatedValue,
  });

  return {
    sql: `(SELECT ${functionName.toUpperCase()}(${sql}) ${fromSql})`,
    type,
  };
};
