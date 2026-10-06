import { VALIDATION_RULE_EXPRESSION_MAX_LENGTH } from '@/constants/ValidationRuleExpressionMaxLength';
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
    name: 'isQualified',
    type: FieldMetadataType.BOOLEAN,
    universalIdentifier: 'opportunity-is-qualified',
  },
  {
    name: 'tags',
    type: FieldMetadataType.MULTI_SELECT,
    universalIdentifier: 'opportunity-tags',
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
      errorCode: 'UNKNOWN_FIELD',
      errorParams: { fieldName: 'closeDate' },
    });
  });

  it('should reject an unknown composite subfield', () => {
    expect(compile('amount.value > 0')).toEqual({
      isValid: false,
      errorMessage: '"value" is not a subfield of "amount"',
      errorCode: 'UNKNOWN_SUBFIELD',
      errorParams: { subfieldName: 'value', fieldName: 'amount' },
    });
  });

  it('should reject a to-many relation path', () => {
    expect(compile('arrayLength(pointOfContacts) > 0')).toEqual({
      isValid: false,
      errorMessage: '"pointOfContacts" is not a to-one relation',
      errorCode: 'NOT_A_TO_ONE_RELATION',
      errorParams: { fieldName: 'pointOfContacts' },
    });
  });

  it('should reject a path going two relations deep', () => {
    expect(compile('isDefined(company.people)')).toEqual({
      isValid: false,
      errorMessage: '"company.people" goes more than one relation deep',
      errorCode: 'RELATION_TOO_DEEP',
      errorParams: { path: 'company.people' },
    });
  });

  it('should reject functions that are not registered', () => {
    expect(compile('random() > 1')).toEqual({
      isValid: false,
      errorMessage: 'Unknown field "random"',
      errorCode: 'UNKNOWN_FIELD',
      errorParams: { fieldName: 'random' },
    });
  });

  it('should reject an expression that does not return true or false', () => {
    expect(compile('stage')).toEqual({
      isValid: false,
      errorMessage: 'Expression did not return true or false',
      errorCode: 'NON_BOOLEAN_RESULT',
    });
    expect(compile('amount.amountMicros + 1').isValid).toBe(false);
  });

  it('should reject bracket access on fields and related records', () => {
    expect(compile('company["industry"] == "SaaS"')).toEqual({
      isValid: false,
      errorMessage: 'Bracket access is not supported, use dot access instead',
      errorCode: 'BRACKET_ACCESS',
    });
    expect(
      compile('stage == "WON" and amount["amountMicros"] > 0').isValid,
    ).toBe(false);
  });

  it('should reject member access written with spaces around the dot', () => {
    expect(compile('company . industry == "SaaS"')).toEqual({
      isValid: false,
      errorMessage: 'Write company.industry without spaces around the dot',
      errorCode: 'SPACED_MEMBER_DOT',
      errorParams: { path: 'company.industry' },
    });
    expect(
      compile('company.industry == "SaaS" or company . industry == "B2B"')
        .isValid,
    ).toBe(false);
    expect(compile('company.industry == "SaaS"').isValid).toBe(true);
  });

  it('should reject the conditional operator, which can return a value that is not true or false', () => {
    expect(compile('isDefined(stage) ? stage : false').isValid).toBe(false);
    expect(compile('stage != "WON" or isDefined(amount)').isValid).toBe(true);
  });

  it('should accept a Boolean field on its own and still reject other fields on their own', () => {
    expect(compile('isQualified').isValid).toBe(true);
    expect(compile('stage').isValid).toBe(false);
  });

  it('should keep array literals', () => {
    expect(compile('stage in ["WON", "LOST"]').isValid).toBe(true);
  });

  it('should accept a value in a list field', () => {
    expect(compile('"PRIORITY" in tags')).toEqual({
      isValid: true,
      bindings: { tags: 'opportunity-tags' },
    });
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
      errorCode: 'EMPTY_EXPRESSION',
    });
  });

  it('should reject an expression over the length cap', () => {
    expect(compile(`stage == "${'x'.repeat(2000)}"`)).toEqual({
      isValid: false,
      errorMessage: `Expression is longer than ${VALIDATION_RULE_EXPRESSION_MAX_LENGTH} characters`,
      errorCode: 'EXPRESSION_TOO_LONG',
      errorParams: { maxLength: VALIDATION_RULE_EXPRESSION_MAX_LENGTH },
    });
  });
});
