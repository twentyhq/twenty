import { CurrencyCode, RATING_VALUES } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type FormulaFieldMetadataType,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { escapeLiteral } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import {
  compileFormulaExpressionToSqlOrThrow,
  type FormulaSqlAggregationSourceResolver,
  type FormulaSqlReferenceResolver,
} from 'src/engine/metadata-modules/formula-field/utils/compile-formula-expression-to-sql.util';
import {
  assertFormulaSqlTypeOrThrow,
  describeFormulaSqlType,
  keepFormulaSqlValueInRange,
  toDateLikeValueOrThrow,
  toDateTimeValue,
  toDoublePrecision,
  toTextSqlOrThrow,
  toUtcDate,
} from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';

type FormulaFieldSqlCompilationResult =
  | {
      isValid: true;
      // One per stored column; a composite field names the sub-field each one fills
      expressions: { compositePropertyName?: string; expression: string }[];
    }
  | { isValid: false; errorMessage: string };

const USAGE = 'This field';

const toTextArraySql = (values: readonly string[]): string =>
  `ARRAY[${values.map(escapeLiteral).join(', ')}]::text[]`;

// Reads as NULL unless the value is one of the allowed ones, evaluating the value once
const keepAllowedText = ({
  textSql,
  allowedValuesSql,
}: {
  textSql: string;
  allowedValuesSql: string;
}): string =>
  `(${allowedValuesSql})[array_position(${allowedValuesSql}, ${textSql})]`;

const coerceToRating = (value: FormulaSqlValue): string =>
  keepAllowedText({
    textSql:
      value.type === 'number'
        ? `'RATING_' || trim_scale(${value.sql})::text`
        : assertFormulaSqlTypeOrThrow({ value, type: 'text', usage: USAGE })
            .sql,
    allowedValuesSql: toTextArraySql(RATING_VALUES),
  });

// Dates keep four-digit years, the only ones record values are read back with
const coerceToColumnExpression = ({
  value,
  fieldMetadataType,
  selectEnumSqlType,
}: {
  value: FormulaSqlValue;
  fieldMetadataType: FormulaFieldMetadataType;
  selectEnumSqlType: string;
}): string => {
  switch (fieldMetadataType) {
    case FieldMetadataType.TEXT:
      return toTextSqlOrThrow({ value, usage: USAGE });
    case FieldMetadataType.NUMBER:
      return toDoublePrecision(
        assertFormulaSqlTypeOrThrow({ value, type: 'number', usage: USAGE })
          .sql,
      );
    case FieldMetadataType.BOOLEAN:
      return assertFormulaSqlTypeOrThrow({
        value,
        type: 'boolean',
        usage: USAGE,
      }).sql;
    case FieldMetadataType.DATE:
      return keepFormulaSqlValueInRange({
        sql: toUtcDate(toDateLikeValueOrThrow({ value, usage: USAGE })),
        minimumSql: `'0001-01-01'::date`,
        maximumSql: `'9999-12-31'::date`,
      });
    case FieldMetadataType.DATE_TIME:
      return keepFormulaSqlValueInRange({
        sql: toDateTimeValue(toDateLikeValueOrThrow({ value, usage: USAGE }))
          .sql,
        minimumSql: `'0001-01-01T00:00:00Z'::timestamptz`,
        maximumSql: `'9999-12-31T23:59:59.999Z'::timestamptz`,
      });
    case FieldMetadataType.SELECT:
      return keepAllowedText({
        textSql: assertFormulaSqlTypeOrThrow({
          value,
          type: 'text',
          usage: USAGE,
        }).sql,
        // The enum itself lists the options, so the value always fits the column type
        allowedValuesSql: `enum_range(NULL::${selectEnumSqlType})::text[]`,
      });
    case FieldMetadataType.RATING:
      return coerceToRating(value);
    case FieldMetadataType.CURRENCY:
      return `floor(${assertFormulaSqlTypeOrThrow({ value, type: 'number', usage: USAGE }).sql} + 0.5)`;
    default:
      return assertUnreachable(fieldMetadataType);
  }
};

export const compileFormulaFieldToSql = ({
  fieldMetadataType,
  expression,
  currencyCodeExpression,
  selectEnumSqlType,
  resolveReference,
  resolveAggregationSource,
}: {
  fieldMetadataType: FormulaFieldMetadataType;
  expression: string;
  currencyCodeExpression?: string;
  selectEnumSqlType: string;
  resolveReference: FormulaSqlReferenceResolver;
  resolveAggregationSource?: FormulaSqlAggregationSourceResolver;
}): FormulaFieldSqlCompilationResult => {
  try {
    const columnExpression = coerceToColumnExpression({
      value: compileFormulaExpressionToSqlOrThrow({
        expression,
        resolveReference,
        resolveAggregationSource,
      }),
      fieldMetadataType,
      selectEnumSqlType,
    });

    if (fieldMetadataType !== FieldMetadataType.CURRENCY) {
      return { isValid: true, expressions: [{ expression: columnExpression }] };
    }

    if (!isDefined(currencyCodeExpression)) {
      throw new FormulaSqlCompilationException({
        message: 'A currency formula needs a currency code expression',
      });
    }

    const currencyCode = compileFormulaExpressionToSqlOrThrow({
      expression: currencyCodeExpression,
      resolveReference,
      resolveAggregationSource,
    });

    if (currencyCode.type !== 'text') {
      throw new FormulaSqlCompilationException({
        message: `The currency code needs text, but got ${describeFormulaSqlType(currencyCode.type)}`,
      });
    }

    const currencyCodeColumnExpression = keepAllowedText({
      textSql: currencyCode.sql,
      allowedValuesSql: toTextArraySql(Object.values(CurrencyCode)),
    });

    // An amount without a currency, or a currency without an amount, is no value at all
    return {
      isValid: true,
      expressions: [
        {
          compositePropertyName: 'amountMicros',
          expression: `CASE WHEN ${currencyCodeColumnExpression} IS NOT NULL THEN ${columnExpression} END`,
        },
        {
          compositePropertyName: 'currencyCode',
          expression: `CASE WHEN ${columnExpression} IS NOT NULL THEN ${currencyCodeColumnExpression} END`,
        },
      ],
    };
  } catch (error) {
    if (error instanceof FormulaSqlCompilationException) {
      return { isValid: false, errorMessage: error.message };
    }

    throw error;
  }
};
