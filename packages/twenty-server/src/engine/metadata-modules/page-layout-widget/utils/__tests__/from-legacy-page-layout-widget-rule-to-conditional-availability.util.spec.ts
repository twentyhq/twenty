import { fromLegacyPageLayoutWidgetRuleToConditionalAvailability } from 'src/engine/metadata-modules/page-layout-widget/utils/from-legacy-page-layout-widget-rule-to-conditional-availability.util';

const MOBILE_JSON_LOGIC = { and: [{ '===': [{ var: 'device' }, 'MOBILE'] }] };

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
      ).toEqual({ isValid: true, node: null });
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
      isValid: true,
      node: {
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
    ).toEqual({ isValid: true, node: deviceIs('DESKTOP') });
  });

  it('should convert a json-logic rule when there is no text rule', () => {
    expect(
      fromLegacyPageLayoutWidgetRuleToConditionalAvailability({
        conditionalAvailabilityExpression: null,
        conditionalDisplay: MOBILE_JSON_LOGIC,
      }),
    ).toEqual({ isValid: true, node: deviceIs('MOBILE') });
  });

  it('should report a json-logic rule it cannot convert', () => {
    expect(
      fromLegacyPageLayoutWidgetRuleToConditionalAvailability({
        conditionalAvailabilityExpression: null,
        conditionalDisplay: {},
      }),
    ).toMatchObject({
      isValid: false,
      errorCode: 'UNSUPPORTED_CONDITIONAL_DISPLAY',
    });
  });

  it('should report a text rule it cannot read', () => {
    expect(
      fromLegacyPageLayoutWidgetRuleToConditionalAvailability({
        conditionalAvailabilityExpression: 'devise == "MOBILE"',
        conditionalDisplay: null,
      }),
    ).toMatchObject({ isValid: false, errorCode: 'UNKNOWN_NAME' });
  });
});
