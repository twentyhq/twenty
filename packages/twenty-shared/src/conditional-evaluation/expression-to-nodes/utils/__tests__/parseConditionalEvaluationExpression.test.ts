import { CONDITIONAL_AVAILABILITY_EXPRESSION_MAX_LENGTH } from '@/conditional-availability/constants/ConditionalAvailabilityExpressionMaxLength';
import { parseConditionalAvailabilityExpression } from '@/conditional-availability/utils/parseConditionalAvailabilityExpression';

const parseWidgetRule = (expression: string | null | undefined) =>
  parseConditionalAvailabilityExpression({
    expression,
    metadataName: 'pageLayoutWidget',
  });

const DEVICE_IS_MOBILE = {
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'VARIABLE', path: 'device' },
  right: { type: 'LITERAL', value: 'MOBILE' },
} as const;

describe('parseConditionalAvailabilityExpression', () => {
  it.each([null, undefined, '', '   '])(
    'should read an empty rule (%p) as no rule',
    (expression) => {
      expect(parseWidgetRule(expression)).toEqual({
        isValid: true,
        node: null,
      });
    },
  );

  it('should read a comparison of a context value with a text', () => {
    expect(parseWidgetRule('device == "MOBILE"')).toEqual({
      isValid: true,
      node: DEVICE_IS_MOBILE,
    });
  });

  it('should read a chain of "or" as one group', () => {
    expect(
      parseWidgetRule('device == "a" or device == "b" or device == "c"'),
    ).toEqual({
      isValid: true,
      node: {
        type: 'GROUP',
        logicalOperator: 'OR',
        children: ['a', 'b', 'c'].map((value) => ({
          type: 'COMPARISON',
          operator: 'EQUAL',
          left: { type: 'VARIABLE', path: 'device' },
          right: { type: 'LITERAL', value },
        })),
      },
    });
  });

  it('should keep a group of another kind nested', () => {
    expect(
      parseWidgetRule(
        'featureFlags.A and (device == "MOBILE" or device == "DESKTOP") and not featureFlags.B',
      ),
    ).toEqual({
      isValid: true,
      node: {
        type: 'GROUP',
        logicalOperator: 'AND',
        children: [
          { type: 'VARIABLE', path: 'featureFlags.A' },
          {
            type: 'GROUP',
            logicalOperator: 'OR',
            children: [
              DEVICE_IS_MOBILE,
              {
                type: 'COMPARISON',
                operator: 'EQUAL',
                left: { type: 'VARIABLE', path: 'device' },
                right: { type: 'LITERAL', value: 'DESKTOP' },
              },
            ],
          },
          { type: 'NOT', child: { type: 'VARIABLE', path: 'featureFlags.B' } },
        ],
      },
    });
  });

  it('should read a function call with its arguments', () => {
    expect(
      parseWidgetRule('everyEquals(selectedRecords, "stage", "WON")'),
    ).toEqual({
      isValid: true,
      node: {
        type: 'FUNCTION_CALL',
        functionName: 'everyEquals',
        arguments: [
          { type: 'VARIABLE', path: 'selectedRecords' },
          { type: 'LITERAL', value: 'stage' },
          { type: 'LITERAL', value: 'WON' },
        ],
      },
    });
  });

  it('should read a negative number and the constants as values', () => {
    expect(
      parseWidgetRule('arrayLength(selectedRecords) > -1 and false'),
    ).toEqual({
      isValid: true,
      node: {
        type: 'GROUP',
        logicalOperator: 'AND',
        children: [
          {
            type: 'COMPARISON',
            operator: 'GREATER_THAN',
            left: {
              type: 'FUNCTION_CALL',
              functionName: 'arrayLength',
              arguments: [{ type: 'VARIABLE', path: 'selectedRecords' }],
            },
            right: { type: 'LITERAL', value: -1 },
          },
          { type: 'LITERAL', value: false },
        ],
      },
    });
  });

  it.each([
    ['arrayLength(selectedRecords) - 1 == 0', '-'],
    ['featureFlags.A; device == "MOBILE"', ';'],
  ])('should refuse %p', (expression, token) => {
    expect(parseWidgetRule(expression)).toMatchObject({
      isValid: false,
      errorCode: 'INVALID_SYNTAX',
      errorParams: { token },
    });
  });

  it.each([
    'selectedRecords[0]',
    'device = "MOBILE"',
    'device == "MOBILE" ? true : false',
    'device == "MOBILE" and',
    'device.constructor == "x"',
    'arrayLength(selectedRecords) + 1 == 2',
  ])('should refuse %p as a syntax error', (expression) => {
    const result = parseWidgetRule(expression);

    expect(result.isValid).toBe(false);
    expect(['INVALID_SYNTAX', 'INCOMPLETE_EXPRESSION']).toContain(
      'errorCode' in result ? result.errorCode : undefined,
    );
  });

  it('should name a text that is not closed', () => {
    expect(parseWidgetRule('device == "MOBILE')).toMatchObject({
      isValid: false,
      errorCode: 'UNCLOSED_TEXT',
    });
  });

  it('should refuse a misspelled variable', () => {
    expect(parseWidgetRule('devise == "MOBILE"')).toMatchObject({
      isValid: false,
      errorCode: 'UNKNOWN_NAME',
      errorParams: { name: 'devise' },
    });
  });

  it('should refuse a rule over the length limit', () => {
    expect(
      parseWidgetRule(
        `device == "${'M'.repeat(CONDITIONAL_AVAILABILITY_EXPRESSION_MAX_LENGTH)}"`,
      ),
    ).toMatchObject({ isValid: false, errorCode: 'EXPRESSION_TOO_LONG' });
  });
});
