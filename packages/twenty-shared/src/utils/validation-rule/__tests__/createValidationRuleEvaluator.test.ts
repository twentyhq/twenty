import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
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

  it('should read a field of the record a relation pointed to before', () => {
    const evaluate = createValidationRuleEvaluator({
      expression:
        'previous.company.employees > 100 and company.employees <= 100',
      fields: [
        {
          name: 'company',
          type: FieldMetadataType.RELATION,
          universalIdentifier: 'opportunity-company',
          relationType: RelationType.MANY_TO_ONE,
          relationTargetFields: FIELDS,
        },
      ],
    });

    expect(
      evaluate({
        record: { company: { id: 'small', employees: 5 } },
        previousRecord: { company: { id: 'big', employees: 500 } },
        now: NOW,
      }),
    ).toEqual({ status: 'passed' });
    expect(
      evaluate({
        record: { company: { id: 'small', employees: 5 } },
        previousRecord: { company: null },
        now: NOW,
      }),
    ).toEqual({ status: 'failed' });
  });
});
