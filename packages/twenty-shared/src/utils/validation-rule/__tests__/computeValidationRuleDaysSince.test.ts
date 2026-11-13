import { FieldMetadataType } from '@/types/FieldMetadataType';
import { createValidationRuleEvaluator } from '@/utils/validation-rule/createValidationRuleEvaluator';
import { computeValidationRuleDaysSince } from '@/utils/validation-rule/computeValidationRuleDaysSince';

describe('computeValidationRuleDaysSince', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-23T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should count whole UTC days since a date-time', () => {
    expect(computeValidationRuleDaysSince('2026-09-16T23:59:00.000Z')).toBe(7);
  });

  it('should count whole days since a date without time', () => {
    expect(computeValidationRuleDaysSince('2026-09-20')).toBe(3);
  });

  it('should be zero today and negative for a future date', () => {
    expect(computeValidationRuleDaysSince('2026-09-23T01:00:00.000Z')).toBe(0);
    expect(computeValidationRuleDaysSince('2026-09-25')).toBe(-2);
  });

  it('should return null for a missing or unreadable date', () => {
    expect(computeValidationRuleDaysSince(null)).toBeNull();
    expect(computeValidationRuleDaysSince(undefined)).toBeNull();
    expect(computeValidationRuleDaysSince('not a date')).toBeNull();
  });
});

describe('daysSince in an expression', () => {
  it('should count from the evaluation now, not the system clock', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-24T00:00:01.000Z'));

    const evaluate = createValidationRuleEvaluator({
      expression: 'daysSince(closeDate) == 0',
      fields: [
        {
          name: 'closeDate',
          type: FieldMetadataType.DATE,
          universalIdentifier: 'close-date',
        },
      ],
    });

    expect(
      evaluate({
        record: { closeDate: '2026-09-23' },
        now: '2026-09-23T23:59:59.000Z',
      }),
    ).toEqual({ status: 'passed' });

    jest.useRealTimers();
  });
});
