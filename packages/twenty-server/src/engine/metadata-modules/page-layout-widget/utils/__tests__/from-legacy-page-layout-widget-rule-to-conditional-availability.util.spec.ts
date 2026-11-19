import { fromLegacyPageLayoutWidgetRuleToConditionalAvailability } from 'src/engine/metadata-modules/page-layout-widget/utils/from-legacy-page-layout-widget-rule-to-conditional-availability.util';

const MOBILE_JSON_LOGIC = { and: [{ '===': [{ var: 'device' }, 'MOBILE'] }] };
const DESKTOP_JSON_LOGIC = {
  and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }],
};

const deviceIs = (device: string) => ({
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'PATH', path: 'device' },
  right: { type: 'LITERAL', value: device },
});

describe('fromLegacyPageLayoutWidgetRuleToConditionalAvailability', () => {
  it.each([
    [null, null],
    [undefined, undefined],
    ['', null],
  ])(
    'should convert a widget with no rule (text %p, json-logic %p) to no rule',
    (conditionalAvailabilityExpression, conditionalDisplay) => {
      expect(
        fromLegacyPageLayoutWidgetRuleToConditionalAvailability({
          conditionalAvailabilityExpression,
          conditionalDisplay,
        }),
      ).toEqual({ isConvertible: true, conditionalAvailability: null });
    },
  );

  it('should convert a text rule to its tree', () => {
    expect(
      fromLegacyPageLayoutWidgetRuleToConditionalAvailability({
        conditionalAvailabilityExpression:
          'featureFlags.IS_AI_CHAT_INBOX_ENABLED and device == "DESKTOP"',
        conditionalDisplay: null,
      }),
    ).toEqual({
      isConvertible: true,
      conditionalAvailability: {
        type: 'GROUP',
        logicalOperator: 'AND',
        children: [
          { type: 'PATH', path: 'featureFlags.IS_AI_CHAT_INBOX_ENABLED' },
          deviceIs('DESKTOP'),
        ],
      },
    });
  });

  it('should let the text rule win over a json-logic rule, as display does today', () => {
    expect(
      fromLegacyPageLayoutWidgetRuleToConditionalAvailability({
        conditionalAvailabilityExpression: 'device == "DESKTOP"',
        conditionalDisplay: MOBILE_JSON_LOGIC,
      }),
    ).toEqual({
      isConvertible: true,
      conditionalAvailability: deviceIs('DESKTOP'),
    });
  });

  it.each([
    ['MOBILE', MOBILE_JSON_LOGIC],
    ['DESKTOP', DESKTOP_JSON_LOGIC],
  ])(
    'should convert the %s json-logic rule when there is no text rule',
    (device, conditionalDisplay) => {
      expect(
        fromLegacyPageLayoutWidgetRuleToConditionalAvailability({
          conditionalAvailabilityExpression: null,
          conditionalDisplay,
        }),
      ).toEqual({
        isConvertible: true,
        conditionalAvailability: deviceIs(device),
      });
    },
  );

  it.each([
    ['a variable it does not know', { '===': [{ var: 'role' }, 'ADMIN'] }],
    ['an empty object', {}],
  ])(
    'should report a json-logic rule with %s as not convertible',
    (_description, conditionalDisplay) => {
      expect(
        fromLegacyPageLayoutWidgetRuleToConditionalAvailability({
          conditionalAvailabilityExpression: null,
          conditionalDisplay,
        }),
      ).toMatchObject({
        isConvertible: false,
        reason: 'UNSUPPORTED_CONDITIONAL_DISPLAY',
      });
    },
  );

  it.each([
    ['arithmetic', 'arrayLength(selectedRecords) - 1 == 0', 'INVALID_SYNTAX'],
    ['an unknown name', 'devise == "MOBILE"', 'UNKNOWN_NAME'],
    ['a text that is not closed', 'device == "MOBILE', 'UNCLOSED_TEXT'],
  ])(
    'should leave a text rule with %s alone',
    (_description, conditionalAvailabilityExpression, reason) => {
      expect(
        fromLegacyPageLayoutWidgetRuleToConditionalAvailability({
          conditionalAvailabilityExpression,
          conditionalDisplay: null,
        }),
      ).toMatchObject({ isConvertible: false, reason });
    },
  );
});
