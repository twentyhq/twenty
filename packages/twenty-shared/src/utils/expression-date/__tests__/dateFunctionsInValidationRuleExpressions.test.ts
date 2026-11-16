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
});
