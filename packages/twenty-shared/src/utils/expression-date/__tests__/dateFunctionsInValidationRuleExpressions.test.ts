import { FieldMetadataType } from '@/types/FieldMetadataType';
import { compileValidationRuleExpression } from '@/utils/validation-rule/compileValidationRuleExpression';
import { createValidationRuleEvaluator } from '@/utils/validation-rule/createValidationRuleEvaluator';

const FIELDS = [
  {
    name: 'createdAt',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: 'created-at',
  },
  {
    name: 'closeDate',
    type: FieldMetadataType.DATE,
    universalIdentifier: 'close-date',
  },
];

describe('date functions in validation rule expressions', () => {
  it.each<[string, boolean]>([
    [
      'dateTrunc("2026-09-23T10:41:59Z", "HOUR") == "2026-09-23T10:00:00Z"',
      true,
    ],
    [
      'dateTrunc("2026-09-23T10:41:59Z", "HOUR") == "2026-09-23T12:00:00+02:00"',
      true,
    ],
    [
      'dateTrunc("2026-09-23T10:41:59Z", "HOUR") != "2026-09-23T10:00:00Z"',
      false,
    ],
    [
      'dateTrunc("2026-09-23T10:41:59Z", "HOUR") < "2026-09-23T10:00:00Z"',
      false,
    ],
    [
      'dateTrunc("2026-09-23T10:41:59Z", "HOUR") <= "2026-09-23T10:00:00Z"',
      true,
    ],
    [
      'dateAdd("2026-09-23T10:00:00Z", 1, "HOUR") > "2026-09-23T12:30:00+02:00"',
      true,
    ],
    [
      'dateAdd("2026-09-23T10:00:00Z", 1, "HOUR") >= "2026-09-23T13:00:00+02:00"',
      true,
    ],
    ['"2026-09-23T23:30:00-02:00" > "2026-09-24T00:30:00Z"', true],
    ['"2026-09-23T10:00:00.1Z" == "2026-09-23T10:00:00.100Z"', true],
    [
      '"2026-09-23T10:00:00.000000001Z" < "2026-09-23T10:00:00.000000002Z"',
      true,
    ],
    [
      '"2026-09-23T10:00:00.000000001Z" == "2026-09-23T10:00:00.000000002Z"',
      false,
    ],
    ['"2026-09-24" == "2026-09-23T23:30:00-02:00"', true],
    ['"2026-09-24T01:30:00Z" != "2026-09-24"', false],
    ['"2026-09-23T10:00:00" <= "2026-09-23"', true],
    ['"abc" < "def"', true],
    ['"not a date" == "not a date"', true],
    ['"2026-99-99" == "2026-99-99"', true],
    ['"123" == 123', false],
    ['true == true', true],
    ['2 > 1', true],
  ])('compares %s as %s', (expression, expected) => {
    const evaluate = createValidationRuleEvaluator({
      expression,
      fields: [],
    });

    expect(evaluate({ record: {}, now: '2026-09-24T12:00:00Z' })).toEqual({
      status: expected ? 'passed' : 'failed',
    });
  });

  it.each([
    ['dateDiff(closeDate, now, "DAYS") > 0', 'INVALID_DATE_UNIT'],
    ['datePart(closeDate, "CENTURY") > 0', 'INVALID_DATE_PART'],
  ])('returns a structured date error for %s', (expression, errorCode) => {
    expect(
      compileValidationRuleExpression({ expression, fields: FIELDS }),
    ).toMatchObject({
      isValid: false,
      errorCode,
    });

    const evaluate = createValidationRuleEvaluator({
      expression,
      fields: FIELDS,
    });

    expect(evaluate({ record: {}, now: '2026-09-24T12:00:00Z' })).toMatchObject(
      {
        status: 'errored',
        errorCode,
      },
    );
  });

  it('should measure from the evaluation now', () => {
    const evaluate = createValidationRuleEvaluator({
      expression: "dateDiff(createdAt, now, 'HOUR') < 24",
      fields: FIELDS,
    });

    expect(
      evaluate({
        record: { createdAt: '2026-09-23T10:00:00.000Z' },
        now: '2026-09-24T09:59:59.000Z',
      }),
    ).toEqual({ status: 'passed' });
    expect(
      evaluate({
        record: { createdAt: '2026-09-23T10:00:00.000Z' },
        now: '2026-09-24T10:00:00.000Z',
      }),
    ).toEqual({ status: 'failed' });
  });

  it('should compare a moved date with a date field', () => {
    const evaluate = createValidationRuleEvaluator({
      expression: "closeDate <= dateAdd(createdAt, 30, 'DAY')",
      fields: FIELDS,
    });

    expect(
      evaluate({
        record: {
          createdAt: '2026-09-01T10:00:00.000Z',
          closeDate: '2026-09-30',
        },
        now: '2026-09-01T10:00:00.000Z',
      }),
    ).toEqual({ status: 'passed' });
  });

  it('should reject an unknown unit when the rule is saved', () => {
    expect(
      compileValidationRuleExpression({
        expression: "dateDiff(createdAt, now, 'DAYS') > 0",
        fields: FIELDS,
      }),
    ).toMatchObject({
      isValid: false,
      errorMessage: expect.stringContaining('"DAYS" is not a date unit'),
    });
  });

  it('should reject the removed daysSince function', () => {
    expect(
      compileValidationRuleExpression({
        expression: 'daysSince(closeDate) >= 0',
        fields: FIELDS,
      }),
    ).toMatchObject({ isValid: false });
  });
});
