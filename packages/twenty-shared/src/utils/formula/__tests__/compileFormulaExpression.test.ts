import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { compileFormulaExpression } from '@/utils/formula/compileFormulaExpression';

const COMPANY_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'name',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'company-name',
  },
];

const OPPORTUNITY_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'opportunity-amount',
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
  compileFormulaExpression({ expression, fields: OPPORTUNITY_FIELDS });

describe('compileFormulaExpression', () => {
  it('should accept an expression that does not return true or false', () => {
    expect(compile('amount.amountMicros / 1000000 * 2')).toEqual({
      isValid: true,
      bindings: { amount: 'opportunity-amount' },
    });
  });

  it('should bind a lookup through a to-one relation', () => {
    expect(compile('company.name || " deal"')).toEqual({
      isValid: true,
      bindings: {
        company: 'opportunity-company',
        'company.name': 'company-name',
      },
    });
  });

  it('should reject a rollup over a to-many relation', () => {
    expect(compile('arrayLength(pointOfContacts)')).toMatchObject({
      isValid: false,
      errorCode: 'NOT_A_TO_ONE_RELATION',
    });
  });

  it('should reject a composite field read without naming its part', () => {
    expect(compile('amount * 2')).toMatchObject({
      isValid: false,
      errorCode: 'COMPOSITE_FIELD_WITHOUT_PART',
      errorParams: { path: 'amount', subfieldName: 'amountMicros' },
    });
  });

  it('should accept a part of a composite field', () => {
    expect(compile('amount.amountMicros * 2')).toMatchObject({ isValid: true });
  });

  it('should reject a previous value', () => {
    expect(compile('previous.amount.amountMicros')).toMatchObject({
      isValid: false,
      errorCode: 'PREVIOUS_VALUE_IN_FORMULA',
      errorParams: { path: 'previous.amount' },
    });
  });

  it('should reject an unknown field', () => {
    expect(compile('revenue * 2')).toMatchObject({
      isValid: false,
      errorCode: 'UNKNOWN_FIELD',
    });
  });

  it('should reject an invalid date unit', () => {
    expect(compile('dateDiff(closeDate, now, "FORTNIGHT")')).toMatchObject({
      isValid: false,
      errorCode: 'INVALID_DATE_UNIT',
    });
  });

  it('should reject an empty expression', () => {
    expect(compile('  ')).toMatchObject({
      isValid: false,
      errorCode: 'EMPTY_EXPRESSION',
    });
  });
});
