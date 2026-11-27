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

const PERSON_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'age',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'person-age',
  },
  {
    name: 'isDecisionMaker',
    type: FieldMetadataType.BOOLEAN,
    universalIdentifier: 'person-is-decision-maker',
  },
];

const TASK_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'dueAt',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: 'task-due-at',
  },
  {
    name: 'updatedAt',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: 'task-updated-at',
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
    relationTargetFields: PERSON_FIELDS,
  },
  {
    name: 'tasks',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-tasks',
    relationType: RelationType.ONE_TO_MANY,
    relationTargetFields: TASK_FIELDS,
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

  it('should bind a count of related records', () => {
    expect(compile('count(pointOfContacts)')).toEqual({
      isValid: true,
      bindings: { pointOfContacts: 'opportunity-point-of-contacts' },
    });
  });

  it('should bind an aggregate filtered on the related records', () => {
    expect(
      compile('sum(pointOfContacts.age, pointOfContacts.isDecisionMaker)'),
    ).toEqual({
      isValid: true,
      bindings: {
        pointOfContacts: 'opportunity-point-of-contacts',
        'pointOfContacts.age': 'person-age',
        'pointOfContacts.isDecisionMaker': 'person-is-decision-maker',
      },
    });
  });

  it('should combine aggregates over several relations', () => {
    expect(compile('count(tasks) + avg(pointOfContacts.age)')).toMatchObject({
      isValid: true,
    });
  });

  it('should read min and max of a relation as aggregates', () => {
    expect(
      compile('dateDiff(min(tasks.dueAt), max(tasks.dueAt), "DAY")'),
    ).toMatchObject({
      isValid: true,
      bindings: { 'tasks.dueAt': 'task-due-at' },
    });
  });

  it('should keep min and max of plain values as scalar functions', () => {
    expect(compile('max(amount.amountMicros, 0)')).toMatchObject({
      isValid: true,
    });
  });

  it('should reject now in a formula that aggregates', () => {
    expect(compile('dateDiff(max(tasks.dueAt), now, "DAY")')).toMatchObject({
      isValid: false,
      errorCode: 'NOT_SUPPORTED_IN_STORED_FORMULA',
      errorParams: { path: 'now' },
    });
  });

  it('should reject updatedAt in a stored formula', () => {
    expect(compile('max(tasks.updatedAt)')).toMatchObject({
      isValid: false,
      errorCode: 'UPDATED_AT_IN_STORED_FORMULA',
      errorParams: { path: 'tasks.updatedAt' },
    });
  });

  it('should accept a lookup in a stored formula', () => {
    expect(compile('count(tasks) || company.name')).toMatchObject({
      isValid: true,
      bindings: {
        tasks: 'opportunity-tasks',
        company: 'opportunity-company',
        'company.name': 'company-name',
      },
    });
    expect(
      compileFormulaExpression({
        expression: 'company.name',
        fields: OPPORTUNITY_FIELDS,
        evaluation: 'STORED',
      }),
    ).toMatchObject({ isValid: true });
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

  it('should reject a to-many relation read outside an aggregate', () => {
    expect(compile('arrayLength(pointOfContacts)')).toMatchObject({
      isValid: false,
      errorCode: 'TO_MANY_RELATION_OUTSIDE_AGGREGATE',
      errorParams: { fieldName: 'pointOfContacts' },
    });
  });

  it('should reject a count of a field instead of a relation', () => {
    expect(compile('count(pointOfContacts.age)')).toMatchObject({
      isValid: false,
      errorCode: 'INVALID_AGGREGATE_ARGUMENT',
      errorParams: { functionName: 'count' },
    });
  });

  it('should reject a sum of a relation instead of a field', () => {
    expect(compile('sum(pointOfContacts)')).toMatchObject({
      isValid: false,
      errorCode: 'INVALID_AGGREGATE_ARGUMENT',
      errorParams: { functionName: 'sum' },
    });
  });

  it('should reject a condition reading another relation', () => {
    expect(
      compile('count(tasks, pointOfContacts.isDecisionMaker)'),
    ).toMatchObject({
      isValid: false,
      errorCode: 'INVALID_AGGREGATE_ARGUMENT',
      errorParams: { relationFieldName: 'pointOfContacts' },
    });
  });

  it('should reject an aggregate nested in another one', () => {
    expect(
      compile(
        'count(pointOfContacts, pointOfContacts.age > avg(pointOfContacts.age))',
      ),
    ).toMatchObject({ isValid: false, errorCode: 'NESTED_AGGREGATE' });
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
