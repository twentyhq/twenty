import { FieldMetadataType } from 'twenty-shared/types';

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
  expression: 'stage == "WON" and isEmpty(amount)',
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
  records: Record<string, unknown>[],
  inputIndexByRecordId = new Map<string, number>(),
) =>
  computeRecordValidationRuleViolations({
    records: records as never,
    flatValidationRules: [WON_WITHOUT_AMOUNT_RULE],
    fields: FIELDS,
    now: '2026-09-23T10:00:00.000Z',
    inputIndexByRecordId,
  });

describe('computeRecordValidationRuleViolations', () => {
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
        records: [{ id: 'record', stage: 'WON' }] as never,
        flatValidationRules: [BROKEN_RULE],
        fields: FIELDS,
        now: '2026-09-23T10:00:00.000Z',
        inputIndexByRecordId: new Map(),
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
