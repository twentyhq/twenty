import { type ConditionalAvailabilityNode } from '@/types/ConditionalAvailabilityNode';
import { type ConditionalAvailabilityRecordFilterMatcher } from '@/types/ConditionalAvailabilityRecordFilterMatcher';
import { RecordFilterOperand } from '@/types/RecordFilterOperand';
import { checkConditionalAvailabilityNode } from '@/utils/conditional-availability/checkConditionalAvailabilityNode';
import { evaluateConditionalAvailabilityNode } from '@/utils/conditional-availability/evaluateConditionalAvailabilityNode';
import { parseConditionalAvailabilityExpression } from '@/utils/conditional-availability/parseConditionalAvailabilityExpression';
import { printConditionalAvailabilityNode } from '@/utils/conditional-availability/printConditionalAvailabilityNode';

const STAGE_FIELD_UNIVERSAL_IDENTIFIER = '20202020-6f76-477d-8551-28cd65b2b4b9';
const AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-583e-4642-8533-db761d5fa82f';

const STAGE_IS_WON_NODE: ConditionalAvailabilityNode = {
  type: 'SELECTED_RECORDS',
  quantifier: 'EVERY',
  recordFilter: {
    fieldMetadataUniversalIdentifier: STAGE_FIELD_UNIVERSAL_IDENTIFIER,
    subFieldName: null,
    operand: RecordFilterOperand.IS,
    value: '["WON"]',
  },
};

const STAGE_IS_WON_EXPRESSION = `everyMatches(selectedRecords, "${STAGE_FIELD_UNIVERSAL_IDENTIFIER}", "IS", "[\\"WON\\"]")`;

const isStageMatching: ConditionalAvailabilityRecordFilterMatcher = ({
  record,
  recordFilter,
}) =>
  recordFilter.value === JSON.stringify([Reflect.get(Object(record), 'stage')]);

const parse = (expression: string) =>
  parseConditionalAvailabilityExpression({
    expression,
    metadataName: 'pageLayoutWidget',
  });

describe('a rule on the selected records', () => {
  it('should read the text form into a record filter', () => {
    expect(parse(STAGE_IS_WON_EXPRESSION)).toEqual({
      isValid: true,
      node: STAGE_IS_WON_NODE,
    });
  });

  it('should print the record filter back as the same text', () => {
    expect(printConditionalAvailabilityNode({ node: STAGE_IS_WON_NODE })).toBe(
      STAGE_IS_WON_EXPRESSION,
    );
  });

  it('should keep a sub field and an operand without value through text', () => {
    const node: ConditionalAvailabilityNode = {
      type: 'GROUP',
      logicalOperator: 'AND',
      children: [
        {
          type: 'SELECTED_RECORDS',
          quantifier: 'SOME',
          recordFilter: {
            fieldMetadataUniversalIdentifier: AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
            subFieldName: 'amountMicros',
            operand: RecordFilterOperand.GREATER_THAN_OR_EQUAL,
            value: '5000',
          },
        },
        {
          type: 'SELECTED_RECORDS',
          quantifier: 'NONE',
          recordFilter: {
            fieldMetadataUniversalIdentifier: STAGE_FIELD_UNIVERSAL_IDENTIFIER,
            subFieldName: null,
            operand: RecordFilterOperand.IS_EMPTY,
            value: '',
          },
        },
      ],
    };

    const expression = printConditionalAvailabilityNode({ node });

    expect(expression).toBe(
      `someMatches(selectedRecords, "${AMOUNT_FIELD_UNIVERSAL_IDENTIFIER}.amountMicros", "GREATER_THAN_OR_EQUAL", "5000") and noneMatches(selectedRecords, "${STAGE_FIELD_UNIVERSAL_IDENTIFIER}", "IS_EMPTY")`,
    );
    expect(parse(expression)).toEqual({ isValid: true, node });
  });

  it.each([
    `everyMatches(currentRole, "${STAGE_FIELD_UNIVERSAL_IDENTIFIER}", "IS", "x")`,
    `everyMatches(selectedRecords, "${STAGE_FIELD_UNIVERSAL_IDENTIFIER}", "EQUALS", "x")`,
    `everyMatches(selectedRecords, "${STAGE_FIELD_UNIVERSAL_IDENTIFIER}", "IS", 3)`,
    `everyMatches(selectedRecords, "${STAGE_FIELD_UNIVERSAL_IDENTIFIER}")`,
    'everyMatches(selectedRecords, "stage", "IS", "x")',
  ])('should refuse the malformed text %p', (expression) => {
    expect(parse(expression).isValid).toBe(false);
  });

  it('should refuse a stored record filter with an unknown key', () => {
    expect(
      checkConditionalAvailabilityNode({
        node: {
          ...STAGE_IS_WON_NODE,
          recordFilter: { fieldName: 'stage', operand: 'IS', value: '' },
        },
        metadataName: 'pageLayoutWidget',
      }),
    ).toMatchObject({ isValid: false, errorCode: 'INVALID_NODE' });
  });

  it.each([
    { quantifier: 'EVERY' as const, stages: ['WON', 'WON'], expected: true },
    { quantifier: 'EVERY' as const, stages: ['WON', 'LOST'], expected: false },
    { quantifier: 'SOME' as const, stages: ['WON', 'LOST'], expected: true },
    { quantifier: 'SOME' as const, stages: ['LOST'], expected: false },
    { quantifier: 'NONE' as const, stages: ['LOST'], expected: true },
    { quantifier: 'NONE' as const, stages: ['WON', 'LOST'], expected: false },
    { quantifier: 'EVERY' as const, stages: [], expected: false },
    { quantifier: 'SOME' as const, stages: [], expected: false },
    { quantifier: 'NONE' as const, stages: [], expected: false },
  ])(
    'should give $expected for $quantifier over stages $stages',
    ({ quantifier, stages, expected }) => {
      expect(
        evaluateConditionalAvailabilityNode({
          node: { ...STAGE_IS_WON_NODE, quantifier },
          context: { selectedRecords: stages.map((stage) => ({ stage })) },
          isRecordMatchingRecordFilter: isStageMatching,
        }),
      ).toBe(expected);
    },
  );

  it('should hide the item when no record filter matcher is given', () => {
    expect(
      evaluateConditionalAvailabilityNode({
        node: { type: 'NOT', child: STAGE_IS_WON_NODE },
        context: { selectedRecords: [{ stage: 'LOST' }] },
      }),
    ).toBe(false);
  });

  it('should hide the item when the matcher throws', () => {
    expect(
      evaluateConditionalAvailabilityNode({
        node: STAGE_IS_WON_NODE,
        context: { selectedRecords: [{ stage: 'WON' }] },
        isRecordMatchingRecordFilter: () => {
          throw new Error('Unknown field');
        },
      }),
    ).toBe(false);
  });
});
