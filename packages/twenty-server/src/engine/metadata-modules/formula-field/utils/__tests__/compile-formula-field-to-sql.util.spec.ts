import {
  FieldMetadataType,
  type FormulaFieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';

import { buildFormulaSqlReferenceResolverFromDescriptors } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-reference-resolver-from-descriptors.util';
import { compileFormulaFieldToSql } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-field-to-sql.util';

const toDescriptor = ({
  name,
  type,
}: {
  name: string;
  type: FieldMetadataType;
}): ValidationRuleFieldDescriptor => ({
  name,
  type,
  universalIdentifier: `${name}-uid`,
});

const FIELDS: ValidationRuleFieldDescriptor[] = [
  toDescriptor({ name: 'name', type: FieldMetadataType.TEXT }),
  toDescriptor({ name: 'price', type: FieldMetadataType.NUMBER }),
  toDescriptor({ name: 'isActive', type: FieldMetadataType.BOOLEAN }),
  toDescriptor({ name: 'createdAt', type: FieldMetadataType.DATE_TIME }),
  toDescriptor({ name: 'dueDate', type: FieldMetadataType.DATE }),
  toDescriptor({ name: 'tags', type: FieldMetadataType.MULTI_SELECT }),
  toDescriptor({ name: 'stage', type: FieldMetadataType.SELECT }),
  toDescriptor({ name: 'amount', type: FieldMetadataType.CURRENCY }),
  toDescriptor({ name: 'payload', type: FieldMetadataType.RAW_JSON }),
  {
    ...toDescriptor({ name: 'supplier', type: FieldMetadataType.RELATION }),
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      toDescriptor({ name: 'name', type: FieldMetadataType.TEXT }),
    ],
  },
  {
    ...toDescriptor({ name: 'lines', type: FieldMetadataType.RELATION }),
    relationType: RelationType.ONE_TO_MANY,
    relationTargetFields: [
      toDescriptor({ name: 'price', type: FieldMetadataType.NUMBER }),
      toDescriptor({ name: 'isActive', type: FieldMetadataType.BOOLEAN }),
      toDescriptor({ name: 'dueDate', type: FieldMetadataType.DATE }),
    ],
  },
];

const LINES_FROM_SQL =
  'FROM "workspace"."line" AS "aggregate_lines" WHERE "aggregate_lines"."gadgetId" = "record"."id" AND "aggregate_lines"."deletedAt" IS NULL';

const compile = ({
  type,
  expression,
  currencyCodeExpression,
}: {
  type: FormulaFieldMetadataType;
  expression: string;
  currencyCodeExpression?: string;
}) =>
  compileFormulaFieldToSql({
    fieldMetadataType: type,
    expression,
    currencyCodeExpression,
    selectEnumSqlType: '"workspace"."gadget_stage_enum"',
    resolveReference: buildFormulaSqlReferenceResolverFromDescriptors({
      fields: FIELDS,
    }),
    resolveAggregationSource: (relationFieldName) =>
      relationFieldName === 'lines'
        ? { tableSql: '"workspace"."line"', joinColumnName: 'gadgetId' }
        : undefined,
  });

describe('compileFormulaFieldToSql', () => {
  it.each<{ type: FormulaFieldMetadataType; expression: string; sql: string }>([
    {
      type: FieldMetadataType.BOOLEAN,
      expression: 'price > 10 and not isActive',
      sql: '(COALESCE("record"."price"::numeric > 10::numeric, FALSE) AND (NOT COALESCE("record"."isActive", FALSE)))',
    },
    {
      type: FieldMetadataType.BOOLEAN,
      expression: 'name == supplier.name',
      sql: '("record"."name" IS NOT DISTINCT FROM "lookup"."name")',
    },
    {
      type: FieldMetadataType.BOOLEAN,
      expression: 'isDefined(supplier) and stage in ["WON", "LOST"]',
      sql: `(("record"."supplierId" IS NOT NULL) AND COALESCE("record"."stage"::text = 'WON'::text OR "record"."stage"::text = 'LOST'::text, FALSE))`,
    },
    {
      type: FieldMetadataType.BOOLEAN,
      expression: 'dueDate < "2024-01-01" and includes(tags, "vip")',
      sql: `(COALESCE("record"."dueDate" < '2024-01-01'::date, FALSE) AND COALESCE('vip'::text = ANY("record"."tags"::text[]), FALSE))`,
    },
    {
      type: FieldMetadataType.BOOLEAN,
      expression: 'createdAt > dueDate',
      sql: `COALESCE((("record"."createdAt") AT TIME ZONE 'UTC')::date > ("record"."dueDate"), FALSE)`,
    },
    {
      type: FieldMetadataType.TEXT,
      expression: `if(isActive, name, "it's off")`,
      sql: `(CASE WHEN COALESCE("record"."isActive", FALSE) THEN "record"."name" ELSE 'it''s off'::text END)`,
    },
    {
      type: FieldMetadataType.DATE,
      expression: 'dateAdd(dueDate, 2, "QUARTER")',
      sql: `(CASE WHEN (((CASE WHEN ("record"."dueDate")::timestamp BETWEEN '0001-01-01'::timestamp AND '9999-12-31 23:59:59.999'::timestamp THEN ("record"."dueDate")::timestamp END) + make_interval(months => ((CASE WHEN trunc(2::numeric) BETWEEN -16000 AND 16000 THEN trunc(2::numeric) END) * 3)::integer))::date) BETWEEN '0001-01-01'::date AND '9999-12-31'::date THEN (((CASE WHEN ("record"."dueDate")::timestamp BETWEEN '0001-01-01'::timestamp AND '9999-12-31 23:59:59.999'::timestamp THEN ("record"."dueDate")::timestamp END) + make_interval(months => ((CASE WHEN trunc(2::numeric) BETWEEN -16000 AND 16000 THEN trunc(2::numeric) END) * 3)::integer))::date) END)`,
    },
    {
      type: FieldMetadataType.SELECT,
      expression: 'if(price > 100, "WON", "LOST")',
      sql: `(enum_range(NULL::"workspace"."gadget_stage_enum")::text[])[array_position(enum_range(NULL::"workspace"."gadget_stage_enum")::text[], (CASE WHEN COALESCE("record"."price"::numeric > 100::numeric, FALSE) THEN 'WON'::text ELSE 'LOST'::text END))]`,
    },
  ])('should compile $expression', ({ type, expression, sql }) => {
    expect(compile({ type, expression })).toEqual({
      isValid: true,
      expressions: [{ expression: sql }],
    });
  });

  it.each<{ type: FormulaFieldMetadataType; expression: string; sql: string }>([
    {
      type: FieldMetadataType.NUMBER,
      expression: 'count(lines)',
      sql: `(SELECT COUNT(*)::numeric ${LINES_FROM_SQL})`,
    },
    {
      type: FieldMetadataType.NUMBER,
      expression: 'sum(lines.price, lines.isActive and price > 0)',
      sql: `(SELECT SUM("aggregate_lines"."price"::numeric) ${LINES_FROM_SQL} AND ((COALESCE("aggregate_lines"."isActive", FALSE) AND COALESCE("record"."price"::numeric > 0::numeric, FALSE))))`,
    },
    {
      type: FieldMetadataType.DATE,
      expression: 'max(lines.dueDate)',
      sql: `(SELECT MAX("aggregate_lines"."dueDate") ${LINES_FROM_SQL})`,
    },
  ])(
    'should aggregate the related records for $expression',
    ({ type, expression, sql }) => {
      const compilation = compile({ type, expression });

      expect(compilation.isValid).toBe(true);
      expect(
        compilation.isValid && compilation.expressions[0].expression,
      ).toContain(sql);
    },
  );

  it('should keep max of plain values a scalar function', () => {
    const compilation = compile({
      type: FieldMetadataType.NUMBER,
      expression: 'max(price, 0)',
    });

    expect(
      compilation.isValid && compilation.expressions[0].expression,
    ).toContain('GREATEST(');
  });

  it.each<{
    type: FormulaFieldMetadataType;
    expression: string;
    errorMessage: string;
  }>([
    {
      type: FieldMetadataType.NUMBER,
      expression: 'sum(lines.isActive)',
      errorMessage: 'sum() needs a number, but got true or false',
    },
    {
      type: FieldMetadataType.NUMBER,
      expression: 'count(supplier)',
      errorMessage:
        'count() needs a relation, for example count(tasks) or sum(deals.amount)',
    },
    {
      type: FieldMetadataType.NUMBER,
      expression: 'count(lines, lines.price)',
      errorMessage:
        'The condition of count() needs true or false, but got a number',
    },
  ])(
    'should refuse the aggregate $expression',
    ({ type, expression, errorMessage }) => {
      expect(compile({ type, expression })).toEqual({
        isValid: false,
        errorMessage,
      });
    },
  );

  it('should read an empty number as 0 and a division by zero as empty', () => {
    expect(
      compile({ type: FieldMetadataType.CURRENCY, expression: 'price / 0' }),
    ).toEqual({
      isValid: false,
      errorMessage: 'A currency formula needs a currency code expression',
    });
    expect(
      compile({
        type: FieldMetadataType.CURRENCY,
        expression: 'price / 0',
        currencyCodeExpression: 'amount.currencyCode',
      }),
    ).toMatchObject({
      isValid: true,
      expressions: [
        {
          compositePropertyName: 'amountMicros',
          expression: expect.stringContaining(
            'THEN floor((COALESCE("record"."price"::numeric, 0) / NULLIF(0::numeric, 0)) + 0.5) END',
          ),
        },
        {
          compositePropertyName: 'currencyCode',
          expression: expect.stringContaining('"record"."amountCurrencyCode"'),
        },
      ],
    });
  });

  it.each<{
    type: FormulaFieldMetadataType;
    expression: string;
    errorMessage: string;
  }>([
    {
      type: FieldMetadataType.NUMBER,
      expression: 'name',
      errorMessage: 'This field needs a number, but got text',
    },
    {
      type: FieldMetadataType.NUMBER,
      expression: 'name * 2',
      errorMessage: '"*" needs a number, but got text',
    },
    {
      type: FieldMetadataType.BOOLEAN,
      expression: 'price == name',
      errorMessage: '"==" cannot mix a number and text',
    },
    {
      type: FieldMetadataType.BOOLEAN,
      expression: 'price and isActive',
      errorMessage: '"and" needs true or false, but got a number',
    },
    {
      type: FieldMetadataType.TEXT,
      expression: 'if(isActive, name, price)',
      errorMessage: 'if cannot mix text and a number',
    },
    {
      type: FieldMetadataType.NUMBER,
      expression: 'dateDiff(createdAt, now, name)',
      errorMessage:
        'dateDiff needs one of "MINUTE", "HOUR", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR"',
    },
    {
      type: FieldMetadataType.DATE,
      expression: 'dateAdd(name, 1, "DAY")',
      errorMessage: 'dateAdd needs a date, but got text',
    },
    {
      type: FieldMetadataType.NUMBER,
      expression: 'dateDiff("0000-01-01", now, "DAY")',
      errorMessage: 'dateDiff needs a date, but got text',
    },
    {
      type: FieldMetadataType.TEXT,
      expression: 'payload',
      errorMessage: '"payload" cannot be read by a formula',
    },
    {
      type: FieldMetadataType.TEXT,
      expression: 'amount',
      errorMessage: '"amount" cannot be read by a formula',
    },
    {
      type: FieldMetadataType.NUMBER,
      expression: 'roundTo(price)',
      errorMessage: 'roundTo takes 2 argument(s), but got 1',
    },
  ])(
    'should refuse $expression as $type',
    ({ type, expression, errorMessage }) => {
      expect(compile({ type, expression })).toEqual({
        isValid: false,
        errorMessage,
      });
    },
  );

  it('should refuse a formula whose SQL grows past the size limit', () => {
    const nestedDateDifference = Array.from({ length: 11 }).reduce<string>(
      (expression) =>
        `dateDiff(now, dateAdd(now, ${expression}, "YEAR"), "MONTH")`,
      '1',
    );

    expect(
      compile({
        type: FieldMetadataType.NUMBER,
        expression: nestedDateDifference,
      }),
    ).toEqual({ isValid: false, errorMessage: 'This formula is too complex' });
  });
});
