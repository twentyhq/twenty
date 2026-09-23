import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { compileValidationRuleExpression } from '@/utils/validation-rule/compileValidationRuleExpression';

const COMPANY_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'industry',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'company-industry',
  },
  {
    name: 'people',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'company-people',
    relationType: RelationType.ONE_TO_MANY,
  },
];

const OPPORTUNITY_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'opportunity-stage',
  },
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'opportunity-amount',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: COMPANY_FIELDS,
  },
  {
    name: 'pointOfContacts',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-point-of-contacts',
    relationType: RelationType.ONE_TO_MANY,
  },
];

const compile = (expression: string) =>
  compileValidationRuleExpression({ expression, fields: OPPORTUNITY_FIELDS });

describe('compileValidationRuleExpression', () => {
  it('should bind every referenced field to its universal identifier', () => {
    expect(
      compile('stage == "WON" and not isDefined(amount.amountMicros)'),
    ).toEqual({
      isValid: true,
      bindings: {
        stage: 'opportunity-stage',
        amount: 'opportunity-amount',
      },
    });
  });

  it('should bind a one-hop to-one relation path', () => {
    expect(compile('company.industry == "SaaS"')).toEqual({
      isValid: true,
      bindings: {
        company: 'opportunity-company',
        'company.industry': 'company-industry',
      },
    });
  });

  it('should accept now as a value', () => {
    expect(compile('isDefined(now)')).toEqual({ isValid: true, bindings: {} });
  });

  it('should reject an unknown field', () => {
    expect(compile('closeDate > now')).toEqual({
      isValid: false,
      errorMessage: 'Unknown field "closeDate"',
    });
  });

  it('should reject an unknown composite subfield', () => {
    expect(compile('amount.value > 0')).toEqual({
      isValid: false,
      errorMessage: '"value" is not a subfield of "amount"',
    });
  });

  it('should reject a to-many relation path', () => {
    expect(compile('arrayLength(pointOfContacts) > 0')).toEqual({
      isValid: false,
      errorMessage: '"pointOfContacts" is not a to-one relation',
    });
  });

  it('should reject a path going two relations deep', () => {
    expect(compile('isDefined(company.people)')).toEqual({
      isValid: false,
      errorMessage: '"company.people" goes more than one relation deep',
    });
  });

  it('should reject functions that are not registered', () => {
    expect(compile('random() > 1')).toEqual({
      isValid: false,
      errorMessage: 'Unknown field "random"',
    });
  });

  it('should reject an expression that does not return true or false', () => {
    expect(compile('stage')).toEqual({
      isValid: false,
      errorMessage: 'Expression did not return true or false',
    });
    expect(compile('amount.amountMicros + 1').isValid).toBe(false);
  });

  it('should reject assignments', () => {
    expect(compile('stage = "WON"').isValid).toBe(false);
  });

  it('should reject a syntax error', () => {
    expect(compile('stage ==').isValid).toBe(false);
  });

  it('should reject an empty expression', () => {
    expect(compile('   ')).toEqual({
      isValid: false,
      errorMessage: 'Expression is empty',
    });
  });

  it('should reject an expression over the length cap', () => {
    expect(compile(`stage == "${'x'.repeat(2000)}"`).isValid).toBe(false);
  });
});
