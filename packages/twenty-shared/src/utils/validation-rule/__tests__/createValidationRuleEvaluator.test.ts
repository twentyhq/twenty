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
      expression: '$f1 > 10',
      bindings: { $f1: 'company-employees' },
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
      expression: '$f1 >',
      bindings: { $f1: 'company-employees' },
      fields: FIELDS,
    });

    expect(evaluate({ record: { employees: 50 }, now: NOW }).status).toBe(
      'errored',
    );
  });

  it('should report a symbol bound to a field that no longer exists as errored', () => {
    const evaluate = createValidationRuleEvaluator({
      expression: '$f1 > 10',
      bindings: { $f1: 'deleted-field' },
      fields: FIELDS,
    });

    expect(evaluate({ record: { employees: 50 }, now: NOW })).toEqual({
      status: 'errored',
      errorMessage: '"$f1" refers to a field that was deleted or deactivated',
    });
  });
});
