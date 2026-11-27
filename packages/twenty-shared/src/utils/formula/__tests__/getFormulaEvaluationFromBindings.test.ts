import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { getFormulaEvaluationFromBindings } from '@/utils/formula/getFormulaEvaluationFromBindings';

const FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'employees',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'company-employees',
  },
  {
    name: 'opportunities',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'company-opportunities',
    relationType: RelationType.ONE_TO_MANY,
    relationTargetFields: [],
  },
];

describe('getFormulaEvaluationFromBindings', () => {
  it('should store a formula that reads a one-to-many relation', () => {
    expect(
      getFormulaEvaluationFromBindings({
        bindings: { opportunities: 'company-opportunities' },
        fields: FIELDS,
      }),
    ).toBe('STORED');
  });

  it('should compute any other formula at query time', () => {
    expect(
      getFormulaEvaluationFromBindings({
        bindings: { employees: 'company-employees' },
        fields: FIELDS,
      }),
    ).toBe('QUERY_TIME');
  });
});
