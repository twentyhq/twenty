import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { evaluateValidationRuleExpression } from '@/utils/validation-rule/evaluateValidationRuleExpression';

const NOW = '2026-09-23T10:00:00.000Z';

const FIELDS: ValidationRuleFieldDescriptor[] = [
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
    name: 'closeDate',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: 'opportunity-close-date',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'industry',
        type: FieldMetadataType.TEXT,
        universalIdentifier: 'company-industry',
      },
      {
        name: 'address',
        type: FieldMetadataType.ADDRESS,
        universalIdentifier: 'company-address',
      },
    ],
  },
];

const evaluate = (expression: string, record: Record<string, unknown>) =>
  evaluateValidationRuleExpression({
    expression,
    record,
    fields: FIELDS,
    now: NOW,
  });

const WON_NEEDS_AMOUNT = 'stage != "WON" or not isEmpty(amount)';

describe('evaluateValidationRuleExpression', () => {
  it('should fail a won opportunity with an empty amount', () => {
    expect(
      evaluate(WON_NEEDS_AMOUNT, {
        stage: 'WON',
        amount: { amountMicros: null, currencyCode: 'USD' },
      }),
    ).toEqual({ status: 'failed' });
  });

  it('should pass a won opportunity with an amount', () => {
    expect(
      evaluate(WON_NEEDS_AMOUNT, {
        stage: 'WON',
        amount: { amountMicros: 1000000, currencyCode: 'USD' },
      }),
    ).toEqual({ status: 'passed' });
  });

  it('should pass an open opportunity with an empty amount', () => {
    expect(
      evaluate(WON_NEEDS_AMOUNT, {
        stage: 'OPEN',
        amount: { amountMicros: null, currencyCode: 'USD' },
      }),
    ).toEqual({ status: 'passed' });
  });

  it('should treat a field missing from the record as null', () => {
    expect(evaluate('not isDefined(stage)', {})).toEqual({ status: 'passed' });
  });

  it('should evaluate a path through a null relation to null', () => {
    const record = { company: null };

    expect(evaluate('isDefined(company)', record)).toEqual({
      status: 'failed',
    });
    expect(evaluate('isDefined(company.industry)', record)).toEqual({
      status: 'failed',
    });
    expect(evaluate('company.industry == "SaaS"', record)).toEqual({
      status: 'failed',
    });
    expect(evaluate('isEmpty(company.address)', record)).toEqual({
      status: 'passed',
    });
  });

  it('should never order a missing value against a defined one', () => {
    expect(evaluate('company.employees < 10', { company: null })).toEqual({
      status: 'failed',
    });
    expect(evaluate('closeDate < now', { closeDate: null })).toEqual({
      status: 'failed',
    });
  });

  it('should read a related record', () => {
    expect(
      evaluate('company.industry == "SaaS"', {
        company: { industry: 'SaaS' },
      }),
    ).toEqual({ status: 'passed' });
  });

  it('should not mutate the record', () => {
    const record = { company: null, amount: { amountMicros: null } };

    evaluate('isDefined(company.industry) or isEmpty(amount)', record);

    expect(record).toEqual({ company: null, amount: { amountMicros: null } });
  });

  it('should compare dates as ISO instants against now', () => {
    expect(
      evaluate('closeDate < now', {
        closeDate: new Date('2026-01-01T00:00:00.000Z'),
      }),
    ).toEqual({ status: 'passed' });
    expect(
      evaluate('closeDate < now', { closeDate: '2027-01-01T00:00:00.000Z' }),
    ).toEqual({ status: 'failed' });
  });

  it('should not treat whitespace as empty', () => {
    expect(evaluate('isEmpty(stage)', { stage: ' ' })).toEqual({
      status: 'failed',
    });
  });

  it('should report an expression that does not return a boolean', () => {
    expect(evaluate('stage', { stage: 'WON' })).toEqual({
      status: 'errored',
      errorMessage: 'Expression did not return true or false',
    });
  });

  it('should report an expression that cannot be parsed', () => {
    expect(evaluate('stage ==', { stage: 'WON' }).status).toBe('errored');
  });
});
