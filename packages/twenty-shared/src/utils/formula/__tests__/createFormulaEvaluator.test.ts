import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { createFormulaEvaluator } from '@/utils/formula/createFormulaEvaluator';

const NOW = '2026-09-23T10:00:00.000Z';

const FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'opportunity-amount',
  },
  {
    name: 'probability',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'opportunity-probability',
  },
  {
    name: 'closeDate',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: 'opportunity-close-date',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'name',
        type: FieldMetadataType.TEXT,
        universalIdentifier: 'company-name',
      },
    ],
  },
];

describe('createFormulaEvaluator', () => {
  it('should compute a number from the record own fields', () => {
    const evaluate = createFormulaEvaluator({
      expression: 'amount.amountMicros / 1000000 * probability',
      fields: FIELDS,
      fieldMetadataType: FieldMetadataType.NUMBER,
    });

    expect(
      evaluate({
        record: {
          amount: { amountMicros: 2000000000, currencyCode: 'USD' },
          probability: 0.5,
        },
        now: NOW,
      }),
    ).toBe(1000);
  });

  it('should read a field of the related record', () => {
    const evaluate = createFormulaEvaluator({
      expression: 'company.name || " deal"',
      fields: FIELDS,
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(evaluate({ record: { company: { name: 'Acme' } }, now: NOW })).toBe(
      'Acme deal',
    );
  });

  it('should pick a branch with if', () => {
    const evaluate = createFormulaEvaluator({
      expression: 'if(probability >= 0.5, "Likely", "Unlikely")',
      fields: FIELDS,
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(
      [{ probability: 0.8 }, { probability: 0.1 }, {}].map((record) =>
        evaluate({ record, now: NOW }),
      ),
    ).toEqual(['Likely', 'Unlikely', 'Unlikely']);
  });

  it('should compute a boolean', () => {
    const evaluate = createFormulaEvaluator({
      expression: 'closeDate < now',
      fields: FIELDS,
      fieldMetadataType: FieldMetadataType.BOOLEAN,
    });

    expect(
      evaluate({ record: { closeDate: '2026-01-01T00:00:00.000Z' }, now: NOW }),
    ).toBe(true);
  });

  it('should compute a date', () => {
    const evaluate = createFormulaEvaluator({
      expression: 'dateAdd(closeDate, 30, "DAY")',
      fields: FIELDS,
      fieldMetadataType: FieldMetadataType.DATE_TIME,
    });

    expect(
      evaluate({ record: { closeDate: '2026-01-01T08:00:00.000Z' }, now: NOW }),
    ).toBe('2026-01-31T08:00:00.000Z');
  });

  it('should return null when the result does not match the field type', () => {
    const evaluate = createFormulaEvaluator({
      expression: 'company.name',
      fields: FIELDS,
      fieldMetadataType: FieldMetadataType.NUMBER,
    });

    expect(
      evaluate({ record: { company: { name: 'Acme' } }, now: NOW }),
    ).toBeNull();
  });

  it('should return null when the related record is missing', () => {
    const evaluate = createFormulaEvaluator({
      expression: 'company.name',
      fields: FIELDS,
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(evaluate({ record: { company: null }, now: NOW })).toBeNull();
  });

  it('should concatenate a missing value as empty text', () => {
    const evaluate = createFormulaEvaluator({
      expression: 'company.name || " deal"',
      fields: FIELDS,
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(evaluate({ record: { company: null }, now: NOW })).toBe(' deal');
  });

  it.each([
    {
      expression: 'coalesce(company.name, "No company")',
      expected: 'No company',
    },
    {
      expression: 'concat("Deal ", company.name, probability)',
      expected: 'Deal 0.25',
    },
    { expression: 'upper(lower("AcMe"))', expected: 'ACME' },
    { expression: 'lower(probability)', expected: null },
  ])('should compute the text $expression', ({ expression, expected }) => {
    const evaluate = createFormulaEvaluator({
      expression,
      fields: FIELDS,
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(
      evaluate({ record: { company: null, probability: 0.25 }, now: NOW }),
    ).toBe(expected);
  });

  it.each([
    {
      expression: 'min(probability, 0.5, amount.amountMicros)',
      expected: 0.256,
    },
    { expression: 'max(probability, 0.5)', expected: 0.5 },
    { expression: 'max(company.name)', expected: null },
    { expression: 'roundTo(probability, 2)', expected: 0.26 },
    { expression: 'roundTo(probability, company.name)', expected: null },
  ])('should compute the number $expression', ({ expression, expected }) => {
    const evaluate = createFormulaEvaluator({
      expression,
      fields: FIELDS,
      fieldMetadataType: FieldMetadataType.NUMBER,
    });

    expect(
      evaluate({ record: { company: null, probability: 0.256 }, now: NOW }),
    ).toBe(expected);
  });

  it.each([
    {
      reason: 'the amount and the currency of another field',
      expression: 'amount.amountMicros * probability',
      currencyCodeExpression: 'amount.currencyCode',
      expected: { amountMicros: 500000000, currencyCode: 'EUR' },
    },
    {
      reason: 'a fixed currency',
      expression: 'amount.amountMicros + 0.4',
      currencyCodeExpression: '"USD"',
      expected: { amountMicros: 2000000000, currencyCode: 'USD' },
    },
    {
      reason: 'a currency code that does not exist',
      expression: 'amount.amountMicros',
      currencyCodeExpression: '"EURO"',
      expected: null,
    },
    {
      reason: 'an amount that is not a number',
      expression: 'company.name',
      currencyCodeExpression: '"USD"',
      expected: null,
    },
  ])(
    'should compute a currency from $reason',
    ({ expression, currencyCodeExpression, expected }) => {
      const evaluate = createFormulaEvaluator({
        expression,
        currencyCodeExpression,
        fields: FIELDS,
        fieldMetadataType: FieldMetadataType.CURRENCY,
      });

      expect(
        evaluate({
          record: {
            amount: { amountMicros: 2000000000, currencyCode: 'EUR' },
            probability: 0.25,
            company: { name: 'Acme' },
          },
          now: NOW,
        }),
      ).toEqual(expected);
    },
  );

  it('should return null when the expression cannot be parsed', () => {
    const evaluate = createFormulaEvaluator({
      expression: 'probability *',
      fields: FIELDS,
      fieldMetadataType: FieldMetadataType.NUMBER,
    });

    expect(evaluate({ record: { probability: 1 }, now: NOW })).toBeNull();
  });
});
