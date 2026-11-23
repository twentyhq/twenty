import {
  FieldMetadataType,
  type FormulaFieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';

import { buildFormulaSqlReferenceResolverFromDescriptors } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-reference-resolver-from-descriptors.util';
import { compileFormulaFieldToSql } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-field-to-sql.util';

const toDescriptor = (
  name: string,
  type: FieldMetadataType,
): ValidationRuleFieldDescriptor => ({
  name,
  type,
  universalIdentifier: `${name}-uid`,
});

const FIELDS: ValidationRuleFieldDescriptor[] = [
  toDescriptor('name', FieldMetadataType.TEXT),
  toDescriptor('price', FieldMetadataType.NUMBER),
  toDescriptor('isActive', FieldMetadataType.BOOLEAN),
  toDescriptor('createdAt', FieldMetadataType.DATE_TIME),
  toDescriptor('dueDate', FieldMetadataType.DATE),
  toDescriptor('tags', FieldMetadataType.MULTI_SELECT),
  toDescriptor('stage', FieldMetadataType.SELECT),
  toDescriptor('amount', FieldMetadataType.CURRENCY),
  toDescriptor('payload', FieldMetadataType.RAW_JSON),
  {
    ...toDescriptor('supplier', FieldMetadataType.RELATION),
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [toDescriptor('name', FieldMetadataType.TEXT)],
  },
];

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
    resolveReference: buildFormulaSqlReferenceResolverFromDescriptors(FIELDS),
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
      sql: `(CASE WHEN ((("record"."dueDate")::timestamp + make_interval(months => ((CASE WHEN trunc(2::numeric) BETWEEN -40000 AND 40000 THEN trunc(2::numeric) END) * 3)::integer))::date) BETWEEN '0001-01-01'::date AND '9999-12-31'::date THEN ((("record"."dueDate")::timestamp + make_interval(months => ((CASE WHEN trunc(2::numeric) BETWEEN -40000 AND 40000 THEN trunc(2::numeric) END) * 3)::integer))::date) END)`,
    },
    {
      type: FieldMetadataType.SELECT,
      expression: 'if(price > 100, "WON", "LOST")',
      sql: `(enum_range(NULL::"workspace"."gadget_stage_enum")::text[])[array_position(enum_range(NULL::"workspace"."gadget_stage_enum")::text[], (CASE WHEN COALESCE("record"."price"::numeric > 100::numeric, FALSE) THEN 'WON'::text ELSE 'LOST'::text END))]`,
    },
  ])('should compile $expression', ({ type, expression, sql }) => {
    expect(compile({ type, expression })).toEqual({
      isValid: true,
      columnExpressions: [sql],
    });
  });

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
      columnExpressions: [
        expect.stringContaining(
          'THEN floor((COALESCE("record"."price"::numeric, 0) / NULLIF(0::numeric, 0)) + 0.5) END',
        ),
        expect.stringContaining('"record"."amountCurrencyCode"'),
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
});
