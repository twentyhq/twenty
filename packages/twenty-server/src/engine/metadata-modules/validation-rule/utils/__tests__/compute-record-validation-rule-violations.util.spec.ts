/* @license Enterprise */

import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeRecordValidationRuleViolations } from 'src/engine/metadata-modules/validation-rule/utils/compute-record-validation-rule-violations.util';

const FIELDS = [
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'stage-universal-identifier',
  },
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'amount-universal-identifier',
  },
];

const WON_WITHOUT_AMOUNT_RULE = {
  id: 'rule-won-without-amount',
  expression: 'stage != "WON" or not isEmpty(amount)',
  message: 'A won opportunity needs an amount',
  errorFieldMetadataId: 'amount-field-metadata-id',
};

const BROKEN_RULE = {
  id: 'rule-broken',
  expression: 'stage',
  message: 'Never shown',
  errorFieldMetadataId: null,
};

const compute = (
  records: ObjectRecord[],
  inputIndexByRecordId = new Map<string, number>(),
  maxViolations = 100,
) =>
  computeRecordValidationRuleViolations({
    records,
    validationRules: [WON_WITHOUT_AMOUNT_RULE],
    fields: FIELDS,
    now: '2026-09-23T10:00:00.000Z',
    inputIndexByRecordId,
    maxViolations,
  });

describe('computeRecordValidationRuleViolations', () => {
  it('should stop once the reported violations reach the cap', () => {
    const invalidRecords = ['first', 'second', 'third'].map((id) => ({
      id,
      stage: 'WON',
      amount: { amountMicros: null, currencyCode: 'USD' },
    }));

    expect(
      compute(invalidRecords, new Map(), 2).violations.map(
        (violation) => violation.recordId,
      ),
    ).toEqual(['first', 'second']);
  });

  it('should report the failing record with its rule, field and input index', () => {
    expect(
      compute(
        [
          {
            id: 'record-valid',
            stage: 'WON',
            amount: { amountMicros: 1000000, currencyCode: 'USD' },
          },
          {
            id: 'record-invalid',
            stage: 'WON',
            amount: { amountMicros: null, currencyCode: 'USD' },
          },
        ],
        new Map([
          ['record-valid', 0],
          ['record-invalid', 1],
        ]),
      ),
    ).toEqual({
      violations: [
        {
          ruleId: 'rule-won-without-amount',
          message: 'A won opportunity needs an amount',
          fieldMetadataId: 'amount-field-metadata-id',
          recordId: 'record-invalid',
          inputIndex: 1,
        },
      ],
      evaluationErrors: [],
    });
  });

  it('should leave the input index null when the write had no input array', () => {
    expect(
      compute([
        {
          id: 'record-invalid',
          stage: 'WON',
          amount: { amountMicros: null, currencyCode: 'USD' },
        },
      ]).violations[0].inputIndex,
    ).toBeNull();
  });

  it('should report a rule that cannot be evaluated as an evaluation error', () => {
    expect(
      computeRecordValidationRuleViolations({
        records: [{ id: 'record', stage: 'WON' }],
        validationRules: [BROKEN_RULE],
        fields: FIELDS,
        now: '2026-09-23T10:00:00.000Z',
        inputIndexByRecordId: new Map(),
        maxViolations: 100,
      }),
    ).toEqual({
      violations: [],
      evaluationErrors: [
        {
          ruleId: 'rule-broken',
          message: 'Never shown',
          fieldMetadataId: null,
          recordId: 'record',
          inputIndex: null,
        },
      ],
    });
  });
});

describe('computeRecordValidationRuleViolations with previous values', () => {
  const NO_SKIPPED_STAGE_RULE = {
    id: 'rule-no-skipped-stage',
    expression:
      'stage == previous.stage or isEmpty(previous.stage) or (previous.stage == "NEW" and stage == "MEETING") or (previous.stage == "MEETING" and stage == "WON")',
    message: 'Move one stage at a time',
    errorFieldMetadataId: 'stage-field-metadata-id',
  };

  const computeTransition = ({
    previousStage,
    stage,
  }: {
    previousStage?: string;
    stage: string;
  }) =>
    computeRecordValidationRuleViolations({
      records: [{ id: 'deal', stage }],
      validationRules: [NO_SKIPPED_STAGE_RULE],
      fields: FIELDS,
      now: '2026-09-23T10:00:00.000Z',
      inputIndexByRecordId: new Map(),
      previousRecordById: new Map(
        isDefined(previousStage)
          ? [['deal', { id: 'deal', stage: previousStage }]]
          : [],
      ),
      maxViolations: 100,
    }).violations.map((violation) => violation.ruleId);

  it('should reject a record that skips a stage since its stored version', () => {
    expect(computeTransition({ previousStage: 'NEW', stage: 'WON' })).toEqual([
      'rule-no-skipped-stage',
    ]);
  });

  it('should accept a record that moves to the next stage', () => {
    expect(
      computeTransition({ previousStage: 'NEW', stage: 'MEETING' }),
    ).toEqual([]);
  });

  it('should read every previous value as empty for a created record', () => {
    expect(computeTransition({ stage: 'WON' })).toEqual([]);
  });
});
