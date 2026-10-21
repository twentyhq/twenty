import { FieldMetadataType } from '@/types/FieldMetadataType';
import { createValidationRuleEvaluator } from '@/utils/validation-rule/createValidationRuleEvaluator';

const NOW = '2026-09-23T10:00:00.000Z';

const FIELDS = [
  {
    name: 'employees',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'company-employees',
  },
];

describe('createValidationRuleEvaluator', () => {
  it('should evaluate one compiled rule against many records', () => {
    const evaluate = createValidationRuleEvaluator({
      expression: 'employees > 10',
      fields: FIELDS,
    });

    expect(
      [{ employees: 50 }, { employees: 3 }, {}].map((record) =>
        evaluate({ record, now: NOW }),
      ),
    ).toEqual([
      { status: 'passed' },
      { status: 'failed' },
      { status: 'failed' },
    ]);
  });

  it('should report an unparsable expression as errored for every record', () => {
    const evaluate = createValidationRuleEvaluator({
      expression: 'employees >',
      fields: FIELDS,
    });

    expect(evaluate({ record: { employees: 50 }, now: NOW }).status).toBe(
      'errored',
    );
  });
});
